const { Question, Option, Test, QuestionCategory, sequelize } = require('../models');

// Add Question to a Test
exports.createQuestion = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { testId } = req.params;
    const {
      question_text,
      question_type,
      points,
      explanation,
      correct_answer_text,
      category_id,
      difficulty,
      tags,
      matching_pairs,
      numerical_answer,
      tolerance,
      unit,
      cloze_template,
      cloze_answers,
      rubric_criteria,
      order_items,
      options,
      order_index
    } = req.body;

    const test = await Test.findOne({
      where: { id: testId, created_by: req.user.id }
    });

    if (!test) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Test not found or unauthorized.' });
    }

    if (!question_text) {
      await transaction.rollback();
      return res.status(400).json({ message: 'Question text is required.' });
    }

    const question = await Question.create(
      {
        test_id: testId,
        category_id: category_id || null,
        created_by: req.user.id,
        is_in_bank: false,
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
        order_index: order_index || 0
      },
      { transaction }
    );

    // If options are provided (for MCQs, True/False)
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

    const createdQuestion = await Question.findByPk(question.id, {
      include: [
        { model: Option, as: 'options', order: [['order_index', 'ASC']] },
        { model: QuestionCategory, as: 'category' }
      ]
    });

    return res.status(201).json({
      message: 'Question added successfully.',
      question: createdQuestion
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Error creating question:', error);
    return res.status(500).json({ message: 'Failed to create question.', error: error.message });
  }
};

// Update Question
exports.updateQuestion = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { id } = req.params;
    const {
      question_text,
      question_type,
      points,
      explanation,
      correct_answer_text,
      category_id,
      difficulty,
      tags,
      matching_pairs,
      numerical_answer,
      tolerance,
      unit,
      cloze_template,
      cloze_answers,
      rubric_criteria,
      order_items,
      options,
      order_index
    } = req.body;

    const question = await Question.findByPk(id, {
      include: [{ model: Test, as: 'test' }]
    });

    if (!question || (question.test && question.test.created_by !== req.user.id && question.created_by !== req.user.id)) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Question not found or unauthorized.' });
    }

    await question.update(
      {
        question_text: question_text !== undefined ? question_text : question.question_text,
        question_type: question_type !== undefined ? question_type : question.question_type,
        points: points !== undefined ? points : question.points,
        explanation: explanation !== undefined ? explanation : question.explanation,
        correct_answer_text: correct_answer_text !== undefined ? correct_answer_text : question.correct_answer_text,
        category_id: category_id !== undefined ? category_id : question.category_id,
        difficulty: difficulty !== undefined ? difficulty : question.difficulty,
        tags: tags !== undefined ? tags : question.tags,
        matching_pairs: matching_pairs !== undefined ? matching_pairs : question.matching_pairs,
        numerical_answer: numerical_answer !== undefined ? Number(numerical_answer) : question.numerical_answer,
        tolerance: tolerance !== undefined ? Number(tolerance) : question.tolerance,
        unit: unit !== undefined ? unit : question.unit,
        cloze_template: cloze_template !== undefined ? cloze_template : question.cloze_template,
        cloze_answers: cloze_answers !== undefined ? cloze_answers : question.cloze_answers,
        rubric_criteria: rubric_criteria !== undefined ? rubric_criteria : question.rubric_criteria,
        order_items: order_items !== undefined ? order_items : question.order_items,
        order_index: order_index !== undefined ? order_index : question.order_index
      },
      { transaction }
    );

    // If options are provided, replace existing options
    if (options && Array.isArray(options)) {
      await Option.destroy({ where: { question_id: id }, transaction });

      const optionsToInsert = options.map((opt, idx) => ({
        question_id: id,
        option_text: opt.option_text || opt.text,
        is_correct: !!opt.is_correct,
        order_index: opt.order_index !== undefined ? opt.order_index : idx
      }));

      await Option.bulkCreate(optionsToInsert, { transaction });
    }

    await transaction.commit();

    const updated = await Question.findByPk(id, {
      include: [
        { model: Option, as: 'options', order: [['order_index', 'ASC']] },
        { model: QuestionCategory, as: 'category' }
      ]
    });

    return res.json({
      message: 'Question updated successfully.',
      question: updated
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Error updating question:', error);
    return res.status(500).json({ message: 'Failed to update question.', error: error.message });
  }
};

// Delete Question
exports.deleteQuestion = async (req, res) => {
  try {
    const { id } = req.params;

    const question = await Question.findByPk(id, {
      include: [{ model: Test, as: 'test' }]
    });

    if (!question || (question.test && question.test.created_by !== req.user.id && question.created_by !== req.user.id)) {
      return res.status(404).json({ message: 'Question not found or unauthorized.' });
    }

    await question.destroy();
    return res.json({ message: 'Question deleted successfully.' });
  } catch (error) {
    console.error('Error deleting question:', error);
    return res.status(500).json({ message: 'Failed to delete question.', error: error.message });
  }
};

// Bulk Import Questions (JSON array)
exports.bulkImportQuestions = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { testId } = req.params;
    const { questions } = req.body;

    if (!Array.isArray(questions) || questions.length === 0) {
      await transaction.rollback();
      return res.status(400).json({ message: 'Questions array is required.' });
    }

    const test = await Test.findOne({
      where: { id: testId, created_by: req.user.id }
    });

    if (!test) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Test not found or unauthorized.' });
    }

    const existingCount = await Question.count({ where: { test_id: testId } });

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      const createdQ = await Question.create(
        {
          test_id: testId,
          question_text: q.question_text || q.text,
          question_type: q.question_type || 'single_choice',
          points: q.points || 1,
          explanation: q.explanation || '',
          correct_answer_text: q.correct_answer_text || null,
          matching_pairs: q.matching_pairs || null,
          numerical_answer: q.numerical_answer !== undefined ? Number(q.numerical_answer) : null,
          tolerance: q.tolerance !== undefined ? Number(q.tolerance) : 0,
          unit: q.unit || null,
          cloze_template: q.cloze_template || null,
          cloze_answers: q.cloze_answers || null,
          rubric_criteria: q.rubric_criteria || null,
          order_items: q.order_items || null,
          order_index: existingCount + i
        },
        { transaction }
      );

      if (q.options && Array.isArray(q.options)) {
        const optionsToInsert = q.options.map((opt, optIdx) => ({
          question_id: createdQ.id,
          option_text: typeof opt === 'string' ? opt : (opt.option_text || opt.text),
          is_correct: typeof opt === 'object' ? !!opt.is_correct : optIdx === (q.correct_index || 0),
          order_index: optIdx
        }));

        await Option.bulkCreate(optionsToInsert, { transaction });
      }
    }

    await transaction.commit();

    const allQuestions = await Question.findAll({
      where: { test_id: testId },
      include: [{ model: Option, as: 'options' }],
      order: [['order_index', 'ASC']]
    });

    return res.status(201).json({
      message: `Successfully imported ${questions.length} questions.`,
      questions: allQuestions
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Error bulk importing questions:', error);
    return res.status(500).json({ message: 'Failed to import questions.', error: error.message });
  }
};
