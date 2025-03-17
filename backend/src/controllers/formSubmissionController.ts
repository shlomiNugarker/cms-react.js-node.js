import { Request, Response } from 'express';
import FormSubmission, { IFormSubmission } from '../models/FormSubmission';
import { sendEmail } from '../utils/emailService';

export const createFormSubmission = async (req: Request, res: Response) => {
  try {
    const formSubmission = new FormSubmission(req.body);
    await formSubmission.save();

    // Send notification email to admin
    await sendEmail({
      to: process.env.ADMIN_EMAIL || 'admin@example.com',
      subject: `New ${req.body.formType} Form Submission`,
      text: `
        New form submission received:
        Type: ${req.body.formType}
        Name: ${req.body.name}
        Email: ${req.body.email}
        Phone: ${req.body.phone || 'N/A'}
        Message: ${req.body.message}
      `
    });

    res.status(201).json(formSubmission);
  } catch (error) {
    res.status(400).json({ message: 'Error creating form submission', error });
  }
};

export const getFormSubmissions = async (req: Request, res: Response) => {
  try {
    const submissions = await FormSubmission.find().sort({ createdAt: -1 });
    res.json(submissions);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching form submissions', error });
  }
};

export const getFormSubmissionById = async (req: Request, res: Response) => {
  try {
    const submission = await FormSubmission.findById(req.params.id);
    if (!submission) {
      return res.status(404).json({ message: 'Form submission not found' });
    }
    res.json(submission);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching form submission', error });
  }
};

export const updateFormSubmissionStatus = async (req: Request, res: Response) => {
  try {
    const submission = await FormSubmission.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );
    if (!submission) {
      return res.status(404).json({ message: 'Form submission not found' });
    }
    res.json(submission);
  } catch (error) {
    res.status(500).json({ message: 'Error updating form submission', error });
  }
};

export const deleteFormSubmission = async (req: Request, res: Response) => {
  try {
    const submission = await FormSubmission.findByIdAndDelete(req.params.id);
    if (!submission) {
      return res.status(404).json({ message: 'Form submission not found' });
    }
    res.json({ message: 'Form submission deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting form submission', error });
  }
}; 