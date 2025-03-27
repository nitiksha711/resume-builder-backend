const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const OpenAI = require("openai");

dotenv.config(); // Load environment variables

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error(err));

// OpenAI API setup
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// Resume Schema
const resumeSchema = new mongoose.Schema({
    name: String,
    contact: String,
    summary: String,
    skills: [String],
    experience: [String],
    education: [String],
    certifications: [String],
    projects: [String],
});

const Resume = mongoose.model('Resume', resumeSchema);

// API endpoint to generate resume
app.post('/generate-resume', async (req, res) => {
    const { name, contact, summary, skills, experience, education, certifications, projects } = req.body;

    const prompt = `Create a professional resume for the following details:\n\n` +
        `Name: ${name}\n` +
        `Contact: ${contact}\n` +
        `Summary: ${summary}\n` +
        `Skills: ${skills.join(', ')}\n` +
        `Experience: ${experience.join(', ')}\n` +
        `Education: ${education.join(', ')}\n` +
        `Certifications: ${certifications.join(', ')}\n` +
        `Projects: ${projects.join(', ')}\n\n` +
        `Please format this as a professional resume.`;

    try {
        const response = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: prompt }],
        });

        const resumeText = response.choices[0].message.content;
        res.json({ resume: resumeText });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error generating resume');
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
