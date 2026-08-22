/**
 * Example script to test AI Resume Screening API
 *
 * Usage:
 *   tsx examples/test-resume-screening.ts
 *
 * Prerequisites:
 *   - Server must be running
 *   - ANTHROPIC_API_KEY must be set in .env
 *   - You must have a valid JWT token for HR/ADMIN user
 *   - A candidate must exist in the database
 */

const API_BASE_URL = 'http://localhost:5000';

// Sample resume text
const sampleResumeText = `
JOHN DOE
Senior Full-Stack Developer
Email: john.doe@example.com | Phone: (555) 123-4567
LinkedIn: linkedin.com/in/johndoe | GitHub: github.com/johndoe

PROFESSIONAL SUMMARY
Experienced Full-Stack Developer with 6+ years of expertise in building scalable web applications.
Proven track record of leading development teams and delivering high-quality software solutions.
Strong proficiency in modern JavaScript frameworks and cloud technologies.

WORK EXPERIENCE

Senior Full-Stack Developer | Tech Innovations Inc. | 2020 - Present
- Led a team of 5 developers in building a SaaS platform serving 10,000+ users
- Architected and implemented microservices using Node.js, Express, and PostgreSQL
- Developed responsive frontend applications using React, TypeScript, and Redux
- Implemented CI/CD pipelines using GitHub Actions and deployed to AWS
- Reduced application load time by 40% through performance optimization

Full-Stack Developer | Digital Solutions Co. | 2018 - 2020
- Developed RESTful APIs using Node.js and MongoDB
- Built interactive dashboards using React and D3.js
- Collaborated with UX designers to implement pixel-perfect interfaces
- Mentored 2 junior developers on best practices and code review

Junior Developer | StartUp Labs | 2017 - 2018
- Contributed to e-commerce platform using MERN stack
- Implemented authentication and authorization using JWT
- Wrote unit tests achieving 85% code coverage

EDUCATION
Bachelor of Science in Computer Science
Massachusetts Institute of Technology (MIT) | 2013 - 2017
GPA: 3.8/4.0

TECHNICAL SKILLS
Languages: JavaScript, TypeScript, Python, SQL
Frontend: React, Next.js, Redux, HTML5, CSS3, Tailwind CSS
Backend: Node.js, Express, NestJS, GraphQL, REST APIs
Databases: PostgreSQL, MongoDB, Redis
Cloud & DevOps: AWS (EC2, S3, Lambda), Docker, Kubernetes, CI/CD
Tools: Git, GitHub Actions, Jest, Webpack, VS Code

CERTIFICATIONS
- AWS Certified Developer Associate (2022)
- MongoDB Certified Developer (2021)

ACHIEVEMENTS
- Led migration of legacy monolith to microservices architecture
- Open source contributor to popular React libraries (500+ stars)
- Speaker at React Conference 2023
`;

const sampleJobRequirements = `
Position: Senior Full-Stack Developer

COMPANY OVERVIEW:
We are a fast-growing SaaS company building innovative HR management solutions.

JOB REQUIREMENTS:

Must Have:
- 5+ years of professional software development experience
- Expert knowledge of React and modern JavaScript/TypeScript
- Strong backend development skills with Node.js and Express
- Experience with PostgreSQL or similar relational databases
- Cloud platform experience (AWS, Azure, or GCP)
- Experience with CI/CD pipelines and DevOps practices
- Team leadership or mentoring experience
- Bachelor's degree in Computer Science or related field

Nice to Have:
- Experience with HR tech or SaaS products
- Knowledge of GraphQL
- Experience with Docker and container orchestration
- Open source contributions
- AWS certifications

RESPONSIBILITIES:
- Lead development of new features for our HRMS platform
- Architect scalable solutions for growing user base
- Mentor junior developers
- Collaborate with product and design teams
- Ensure code quality and best practices
- Participate in technical decision making

COMPENSATION:
$120,000 - $160,000 per year based on experience
`;

async function testResumeScreening() {
  console.log('🤖 AI Resume Screening API Test\n');
  console.log('=' .repeat(60));

  // You would get this from authentication endpoint
  const AUTH_TOKEN = process.env.TEST_AUTH_TOKEN || 'your-jwt-token-here';
  const CANDIDATE_ID = process.env.TEST_CANDIDATE_ID || 'candidate-id-here';

  if (AUTH_TOKEN === 'your-jwt-token-here' || CANDIDATE_ID === 'candidate-id-here') {
    console.error('❌ Error: Please set TEST_AUTH_TOKEN and TEST_CANDIDATE_ID environment variables');
    console.log('\nExample:');
    console.log('  export TEST_AUTH_TOKEN="your-actual-jwt-token"');
    console.log('  export TEST_CANDIDATE_ID="cm4abc123def456"');
    console.log('  tsx examples/test-resume-screening.ts');
    process.exit(1);
  }

  try {
    console.log('📄 Resume Length:', sampleResumeText.length, 'characters');
    console.log('📋 Job Requirements Length:', sampleJobRequirements.length, 'characters');
    console.log('👤 Candidate ID:', CANDIDATE_ID);
    console.log('\n⏳ Calling AI Resume Screening API...\n');

    const startTime = Date.now();

    const response = await fetch(`${API_BASE_URL}/api/jobs/screen-resume`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${AUTH_TOKEN}`
      },
      body: JSON.stringify({
        resumeText: sampleResumeText,
        jobRequirements: sampleJobRequirements,
        candidateId: CANDIDATE_ID
      })
    });

    const duration = Date.now() - startTime;

    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ API Error:', errorData);
      process.exit(1);
    }

    const result = await response.json();

    console.log('✅ Screening Complete!');
    console.log('⏱️  Duration:', duration, 'ms');
    console.log('\n' + '='.repeat(60));
    console.log('📊 SCREENING RESULTS');
    console.log('='.repeat(60));
    console.log('\nCandidate:', result.data.candidateName);
    console.log('Job Title:', result.data.jobTitle);
    console.log('\n📈 FIT SCORE:', result.data.screening.fitScore, '/100');
    console.log('💡 RECOMMENDATION:', result.data.screening.recommendation);

    console.log('\n✨ STRENGTHS:');
    result.data.screening.strengths.forEach((strength: string, i: number) => {
      console.log(`   ${i + 1}. ${strength}`);
    });

    console.log('\n⚠️  WEAKNESSES:');
    result.data.screening.weaknesses.forEach((weakness: string, i: number) => {
      console.log(`   ${i + 1}. ${weakness}`);
    });

    console.log('\n🔧 EXTRACTED SKILLS:');
    const skills = result.data.screening.skills.join(', ');
    console.log(`   ${skills}`);

    console.log('\n📚 EXPERIENCE:', result.data.screening.experience, 'years');
    console.log('🎓 EDUCATION:', result.data.screening.education);

    console.log('\n' + '='.repeat(60));
    console.log('💾 Database Updated:');
    console.log('   - Candidate AI Score:', result.data.updatedCandidate.aiScore);
    console.log('   - Activity logged for audit trail');
    console.log('='.repeat(60) + '\n');

    // Recommendation interpretation
    const recommendation = result.data.screening.recommendation;
    if (recommendation === 'STRONG_FIT') {
      console.log('✅ NEXT STEPS: Proceed to interview stage immediately');
    } else if (recommendation === 'MODERATE_FIT') {
      console.log('⚠️  NEXT STEPS: Review manually, consider for interview');
    } else if (recommendation === 'WEAK_FIT') {
      console.log('🤔 NEXT STEPS: Review carefully, may need additional screening');
    } else {
      console.log('❌ NEXT STEPS: Consider rejecting or requesting more information');
    }

    console.log('\n✨ Test completed successfully!\n');

  } catch (error: any) {
    console.error('\n❌ Test Failed:', error.message);
    if (error.cause) {
      console.error('Cause:', error.cause);
    }
    process.exit(1);
  }
}

// Run the test
testResumeScreening();
