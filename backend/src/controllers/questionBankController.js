const { Question, Option, QuestionCategory, Test, sequelize } = require('../models');
const { Op } = require('sequelize');

// --- Categories ---
exports.getCategories = async (req, res) => {
  try {
    const categories = await QuestionCategory.findAll({
      where: { teacher_id: req.user.id },
      include: [
        {
          model: Question,
          as: 'questions',
          attributes: ['id']
        }
      ],
      order: [['name', 'ASC']]
    });

    const formatted = categories.map((cat) => {
      const c = cat.toJSON();
      return {
        ...c,
        question_count: (c.questions || []).length
      };
    });

    return res.json({ categories: formatted });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return res.status(500).json({ message: 'Failed to fetch categories.', error: error.message });
  }
};

exports.createCategory = async (req, res) => {
  try {
    const { name, description, color } = req.body;
    if (!name) {
      return res.status(400).json({ message: 'Category name is required.' });
    }

    const category = await QuestionCategory.create({
      name,
      description,
      color: color || '#4f46e5',
      teacher_id: req.user.id
    });

    return res.status(201).json({ message: 'Category created successfully.', category });
  } catch (error) {
    console.error('Error creating category:', error);
    return res.status(500).json({ message: 'Failed to create category.', error: error.message });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await QuestionCategory.findOne({
      where: { id, teacher_id: req.user.id }
    });

    if (!category) {
      return res.status(404).json({ message: 'Category not found or unauthorized.' });
    }

    await category.destroy();
    return res.json({ message: 'Category deleted successfully.' });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to delete category.' });
  }
};

// --- Question Bank Search & CRUD ---
exports.getBankQuestions = async (req, res) => {
  try {
    const { category_id, difficulty, question_type, search } = req.query;

    const where = {
      [Op.or]: [
        { created_by: req.user.id },
        { is_in_bank: true }
      ]
    };

    if (category_id) {
      where.category_id = category_id;
    }
    if (difficulty) {
      where.difficulty = difficulty;
    }
    if (question_type) {
      where.question_type = question_type;
    }
    if (search) {
      where.question_text = { [Op.like]: `%${search}%` };
    }

    const questions = await Question.findAll({
      where,
      include: [
        { model: Option, as: 'options' },
        { model: QuestionCategory, as: 'category', attributes: ['id', 'name', 'color'] }
      ],
      order: [['createdAt', 'DESC']]
    });

    return res.json({ questions });
  } catch (error) {
    console.error('Error fetching question bank:', error);
    return res.status(500).json({ message: 'Failed to fetch questions.', error: error.message });
  }
};

exports.createBankQuestion = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const {
      category_id,
      difficulty,
      tags,
      question_text,
      question_type,
      points,
      explanation,
      correct_answer_text,
      matching_pairs,
      numerical_answer,
      tolerance,
      unit,
      cloze_template,
      cloze_answers,
      rubric_criteria,
      order_items,
      options
    } = req.body;

    if (!question_text) {
      await transaction.rollback();
      return res.status(400).json({ message: 'Question text is required.' });
    }

    const question = await Question.create(
      {
        test_id: null,
        category_id: category_id || null,
        is_in_bank: true,
        created_by: req.user.id,
        difficulty: difficulty || 'medium',
        tags: tags || [],
        question_text,
        question_type: question_type || 'single_choice',
        points: points || 1,
        explanation: explanation || '',
        correct_answer_text: correct_answer_text || null,
        matching_pairs: matching_pairs || null,
        numerical_answer: numerical_answer !== undefined ? Number(numerical_answer) : null,
        tolerance: tolerance !== undefined ? Number(tolerance) : 0,
        unit: unit || null,
        cloze_template: cloze_template || null,
        cloze_answers: cloze_answers || null,
        rubric_criteria: rubric_criteria || null,
        order_items: order_items || null,
        order_index: 0
      },
      { transaction }
    );

    if (options && Array.isArray(options) && options.length > 0) {
      const optionsToInsert = options.map((opt, idx) => ({
        question_id: question.id,
        option_text: opt.option_text || opt.text,
        is_correct: !!opt.is_correct,
        order_index: opt.order_index !== undefined ? opt.order_index : idx
      }));
      await Option.bulkCreate(optionsToInsert, { transaction });
    }

    await transaction.commit();

    const created = await Question.findByPk(question.id, {
      include: [
        { model: Option, as: 'options' },
        { model: QuestionCategory, as: 'category' }
      ]
    });

    return res.status(201).json({ message: 'Question saved to Question Bank.', question: created });
  } catch (error) {
    await transaction.rollback();
    console.error('Error creating bank question:', error);
    return res.status(500).json({ message: 'Failed to create question.', error: error.message });
  }
};

// Import Selected Questions from Bank into a Test
exports.importFromBankToTest = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { testId, questionIds } = req.body;

    const test = await Test.findOne({
      where: { id: testId, created_by: req.user.id }
    });

    if (!test) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Test not found or unauthorized.' });
    }

    if (!Array.isArray(questionIds) || questionIds.length === 0) {
      await transaction.rollback();
      return res.status(400).json({ message: 'No questions selected for import.' });
    }

    const bankQuestions = await Question.findAll({
      where: { id: { [Op.in]: questionIds } },
      include: [{ model: Option, as: 'options' }]
    });

    const currentCount = await Question.count({ where: { test_id: testId } });

    for (let i = 0; i < bankQuestions.length; i++) {
      const bq = bankQuestions[i];
      const newQ = await Question.create(
        {
          test_id: testId,
          category_id: bq.category_id,
          is_in_bank: false,
          created_by: req.user.id,
          difficulty: bq.difficulty,
          tags: bq.tags,
          question_text: bq.question_text,
          question_type: bq.question_type,
          points: bq.points,
          explanation: bq.explanation,
          correct_answer_text: bq.correct_answer_text,
          matching_pairs: bq.matching_pairs,
          numerical_answer: bq.numerical_answer,
          tolerance: bq.tolerance,
          unit: bq.unit,
          cloze_template: bq.cloze_template,
          cloze_answers: bq.cloze_answers,
          rubric_criteria: bq.rubric_criteria,
          order_items: bq.order_items,
          order_index: currentCount + i
        },
        { transaction }
      );

      if (bq.options && bq.options.length > 0) {
        await Option.bulkCreate(
          bq.options.map((opt) => ({
            question_id: newQ.id,
            option_text: opt.option_text,
            is_correct: opt.is_correct,
            order_index: opt.order_index
          })),
          { transaction }
        );
      }
    }

    await transaction.commit();

    return res.json({
      message: `Successfully imported ${bankQuestions.length} question(s) into ${test.title}.`
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Error importing questions from bank:', error);
    return res.status(500).json({ message: 'Failed to import questions.', error: error.message });
  }
};

// Add Random Question Pool from a category to a test
exports.addRandomPoolToTest = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { testId, category_id, count, difficulty } = req.body;

    const test = await Test.findOne({
      where: { id: testId, created_by: req.user.id }
    });

    if (!test) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Test not found or unauthorized.' });
    }

    const where = {};
    if (category_id) where.category_id = category_id;
    if (difficulty) where.difficulty = difficulty;

    const available = await Question.findAll({
      where,
      include: [{ model: Option, as: 'options' }]
    });

    if (available.length === 0) {
      await transaction.rollback();
      return res.status(400).json({ message: 'No questions found matching criteria.' });
    }

    // Shuffle and pick
    const numToPick = Math.min(count || 5, available.length);
    const shuffled = [...available].sort(() => Math.random() - 0.5).slice(0, numToPick);

    const currentCount = await Question.count({ where: { test_id: testId } });

    for (let i = 0; i < shuffled.length; i++) {
      const bq = shuffled[i];
      const newQ = await Question.create(
        {
          test_id: testId,
          category_id: bq.category_id,
          is_in_bank: false,
          created_by: req.user.id,
          difficulty: bq.difficulty,
          tags: bq.tags,
          question_text: bq.question_text,
          question_type: bq.question_type,
          points: bq.points,
          explanation: bq.explanation,
          correct_answer_text: bq.correct_answer_text,
          matching_pairs: bq.matching_pairs,
          numerical_answer: bq.numerical_answer,
          tolerance: bq.tolerance,
          unit: bq.unit,
          cloze_template: bq.cloze_template,
          cloze_answers: bq.cloze_answers,
          rubric_criteria: bq.rubric_criteria,
          order_items: bq.order_items,
          order_index: currentCount + i
        },
        { transaction }
      );

      if (bq.options && bq.options.length > 0) {
        await Option.bulkCreate(
          bq.options.map((opt) => ({
            question_id: newQ.id,
            option_text: opt.option_text,
            is_correct: opt.is_correct,
            order_index: opt.order_index
          })),
          { transaction }
        );
      }
    }

    await transaction.commit();

    return res.json({
      message: `Successfully added ${shuffled.length} random question(s) from question bank.`
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Error adding random pool:', error);
    return res.status(500).json({ message: 'Failed to add random pool.', error: error.message });
  }
};

// Export Questions (JSON)
exports.exportQuestions = async (req, res) => {
  try {
    const { category_id } = req.query;
    const where = { is_in_bank: true };
    if (category_id) where.category_id = category_id;

    const questions = await Question.findAll({
      where,
      include: [
        { model: Option, as: 'options', attributes: ['option_text', 'is_correct', 'order_index'] },
        { model: QuestionCategory, as: 'category', attributes: ['name'] }
      ]
    });

    return res.json({
      export_version: '1.0',
      exported_at: new Date().toISOString(),
      total_count: questions.length,
      questions
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to export questions.' });
  }
};
