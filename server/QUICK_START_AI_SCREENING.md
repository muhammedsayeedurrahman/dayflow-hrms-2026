# Quick Start: AI Resume Screening

Get started with AI-powered resume screening in 5 minutes.

## Step 1: Get Your API Key

1. Visit https://console.anthropic.com/
2. Sign up or log in
3. Go to **Settings** → **API Keys**
4. Click **Create Key**
5. Copy the key (starts with `sk-ant-`)

## Step 2: Configure Environment

Add to your `.env` file:

```bash
ANTHROPIC_API_KEY=sk-ant-your-actual-api-key-here
```

## Step 3: Restart Server

```bash
npm run dev
```

## Step 4: Test the API

### Option A: Using the Test Script

```bash
# Set your credentials
export TEST_AUTH_TOKEN="your-jwt-token-from-login"
export TEST_CANDIDATE_ID="existing-candidate-id"

# Run test
tsx examples/test-resume-screening.ts
```

### Option B: Using cURL

```bash
curl -X POST http://localhost:5000/api/jobs/screen-resume \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "resumeText": "John Doe\nSenior Developer\n5 years experience with React and Node.js...",
    "jobRequirements": "Looking for Senior Developer with React, Node.js, 5+ years experience",
    "candidateId": "cm4abc123"
  }'
```

### Option C: Using JavaScript

```javascript
const response = await fetch('http://localhost:5000/api/jobs/screen-resume', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${yourToken}`
  },
  body: JSON.stringify({
    resumeText: "Resume content here...",
    jobRequirements: "Job requirements here...",
    candidateId: "candidate-id"
  })
});

const result = await response.json();
console.log('Fit Score:', result.data.screening.fitScore);
console.log('Recommendation:', result.data.screening.recommendation);
```

## Step 5: Understand the Response

```json
{
  "success": true,
  "data": {
    "screening": {
      "fitScore": 85,                    // 0-100 score
      "recommendation": "STRONG_FIT",    // STRONG_FIT | MODERATE_FIT | WEAK_FIT | REJECT
      "strengths": ["...", "...", "..."], // Top 3 strengths
      "weaknesses": ["...", "...", "..."], // Top 3 weaknesses
      "skills": ["React", "Node.js", ...], // Extracted skills
      "experience": 5,                    // Years of experience
      "education": "B.S. Computer Science" // Highest degree
    }
  }
}
```

## Requirements

- ✅ User must have HR or ADMIN role
- ✅ Valid JWT token required
- ✅ Candidate must exist in database
- ✅ ANTHROPIC_API_KEY must be set

## Common Issues

### "AI service is not configured"
→ Set `ANTHROPIC_API_KEY` in `.env` and restart server

### "Only HR/ADMIN can perform resume screening"
→ Login with HR or ADMIN user credentials

### "Candidate not found"
→ Verify the candidateId exists in your database

## Next Steps

- Read full documentation: `docs/AI_RESUME_SCREENING_API.md`
- View implementation details: `AI_RESUME_SCREENING_IMPLEMENTATION.md`
- Check TypeScript types: `src/types/resumeScreening.ts`

## Cost

~$0.003 - $0.015 per resume screening
100 screenings ≈ $0.30 - $1.50

## Support

For questions or issues, check:
- Server logs for errors
- Anthropic API status: https://status.anthropic.com/
- Documentation in `docs/` folder
