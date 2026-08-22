# AI Resume Screening API

## Overview

The AI Resume Screening API uses Claude (Anthropic's AI) to automatically analyze candidate resumes against job requirements and provide intelligent hiring recommendations.

## Endpoint

```
POST /api/jobs/screen-resume
```

## Authentication

Requires authentication token in header:
```
Authorization: Bearer <your-jwt-token>
```

**Permissions**: Only users with `HR` or `ADMIN` roles can access this endpoint.

## Request Body

```typescript
{
  resumeText: string,      // Extracted text from candidate's resume (PDF/DOC)
  jobRequirements: string, // Job description and requirements
  candidateId: string      // ID of the candidate in the database
}
```

### Example Request

```json
{
  "resumeText": "John Doe\nSenior Full-Stack Developer\n\nEXPERIENCE:\n- 5 years at Tech Corp as Full-Stack Developer\n- Built scalable web applications using React, Node.js, PostgreSQL\n- Led team of 4 developers\n\nEDUCATION:\nB.S. Computer Science, MIT, 2018\n\nSKILLS:\nReact, Node.js, TypeScript, PostgreSQL, AWS, Docker, CI/CD",

  "jobRequirements": "We're looking for a Senior Full-Stack Developer with 5+ years of experience. Must have:\n- Strong React and Node.js skills\n- Experience with TypeScript and PostgreSQL\n- Cloud deployment experience (AWS/Azure)\n- Team leadership experience\n- Bachelor's degree in Computer Science or related field",

  "candidateId": "cm4abc123def456"
}
```

## Response

### Success Response (200 OK)

```json
{
  "success": true,
  "data": {
    "candidateId": "cm4abc123def456",
    "candidateName": "John Doe",
    "jobTitle": "Senior Full-Stack Developer",
    "screening": {
      "fitScore": 85,
      "strengths": [
        "Strong technical skills matching job requirements",
        "Proven leadership experience with team of 4",
        "Relevant education from top institution"
      ],
      "weaknesses": [
        "Limited cloud platform diversity (only AWS mentioned)",
        "No mention of CI/CD pipeline design experience",
        "Missing Azure experience mentioned in job requirements"
      ],
      "skills": [
        "React",
        "Node.js",
        "TypeScript",
        "PostgreSQL",
        "AWS",
        "Docker",
        "CI/CD",
        "Team Leadership"
      ],
      "experience": 5,
      "education": "Bachelor of Science in Computer Science",
      "recommendation": "STRONG_FIT"
    },
    "updatedCandidate": {
      "id": "cm4abc123def456",
      "name": "John Doe",
      "email": "john.doe@example.com",
      "aiScore": 85,
      // ... other candidate fields
    }
  }
}
```

### Recommendation Values

- `STRONG_FIT` - Highly recommended candidate (typically 75-100 fit score)
- `MODERATE_FIT` - Good candidate with some gaps (typically 50-74 fit score)
- `WEAK_FIT` - May not be ideal but could work (typically 25-49 fit score)
- `REJECT` - Not recommended for the position (typically 0-24 fit score)

## Error Responses

### 400 Bad Request - Missing Resume Text
```json
{
  "success": false,
  "error": "Resume text is required and must not be empty"
}
```

### 400 Bad Request - Missing Job Requirements
```json
{
  "success": false,
  "error": "Job requirements are required and must not be empty"
}
```

### 400 Bad Request - Missing Candidate ID
```json
{
  "success": false,
  "error": "Candidate ID is required"
}
```

### 403 Forbidden - Insufficient Permissions
```json
{
  "success": false,
  "error": "Only HR/ADMIN can perform resume screening"
}
```

### 404 Not Found - Candidate Not Found
```json
{
  "success": false,
  "error": "Candidate not found"
}
```

### 500 Internal Server Error - Missing API Key
```json
{
  "success": false,
  "error": "AI service is not configured. Please set ANTHROPIC_API_KEY in environment variables."
}
```

### 500 Internal Server Error - API Failure
```json
{
  "success": false,
  "error": "Failed to analyze resume using AI service",
  "details": "API error message"
}
```

## Setup Instructions

### 1. Get Anthropic API Key

1. Visit https://console.anthropic.com/
2. Sign up or log in
3. Navigate to Settings > API Keys
4. Create a new API key
5. Copy the key (starts with `sk-ant-`)

### 2. Configure Environment Variable

Add to your `.env` file:

```bash
ANTHROPIC_API_KEY=sk-ant-your-actual-api-key-here
```

### 3. Verify Installation

The `@anthropic-ai/sdk` package should already be installed. If not:

```bash
cd server
npm install @anthropic-ai/sdk
```

## Usage Example with cURL

```bash
curl -X POST http://localhost:5000/api/jobs/screen-resume \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "resumeText": "John Doe\n Senior Developer\n...",
    "jobRequirements": "Looking for Senior Developer with...",
    "candidateId": "cm4abc123def456"
  }'
```

## Usage Example with JavaScript/TypeScript

```typescript
async function screenCandidateResume(
  resumeText: string,
  jobRequirements: string,
  candidateId: string,
  authToken: string
) {
  const response = await fetch('http://localhost:5000/api/jobs/screen-resume', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`
    },
    body: JSON.stringify({
      resumeText,
      jobRequirements,
      candidateId
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error);
  }

  const result = await response.json();
  return result.data;
}

// Usage
const screening = await screenCandidateResume(
  resumeText,
  jobRequirements,
  'cm4abc123def456',
  userToken
);

console.log(`Fit Score: ${screening.screening.fitScore}/100`);
console.log(`Recommendation: ${screening.screening.recommendation}`);
```

## Database Changes

The API automatically:

1. **Updates the Candidate record** - Sets the `aiScore` field to the fit score (0-100)
2. **Creates an Activity Log** - Records the screening action with details including:
   - User who performed the screening
   - Fit score and recommendation
   - Job title
   - Timestamp

## Best Practices

### Resume Text Extraction

For best results, extract clean text from PDF/DOC files:

- Remove excessive formatting
- Preserve structure (sections, headings)
- Include all relevant sections (Experience, Education, Skills)
- Avoid binary data or images

### Job Requirements

Provide clear, detailed job requirements:

```
✅ GOOD:
"Senior Full-Stack Developer with 5+ years experience.
Required: React, Node.js, TypeScript, PostgreSQL
Preferred: AWS, Docker, Team Leadership
Education: Bachelor's in Computer Science or equivalent"

❌ BAD:
"Need developer"
```

### Rate Limiting

Consider implementing rate limiting for AI API calls to:
- Control costs
- Avoid API quota exhaustion
- Prevent abuse

### Error Handling

Always handle potential errors:
- Network failures
- API quota exceeded
- Invalid API key
- Malformed resume text

## Cost Considerations

Each resume screening request:
- Uses Claude Sonnet 4.5 model
- Consumes ~1,024 tokens maximum per request
- Cost: Approximately $0.003 - $0.015 per screening (based on Anthropic pricing)

For high-volume screening (100+ resumes/day), consider:
- Batch processing
- Caching results
- Using a smaller model for initial filtering

## Activity Logging

All screening actions are logged to the `ActivityLog` table with:

```typescript
{
  userId: string,           // HR user who performed screening
  action: "AI_SCREEN",
  entity: "CANDIDATE",
  entityId: string,         // Candidate ID
  details: {
    fitScore: number,
    recommendation: string,
    jobTitle: string,
    screenedBy: string      // Email of HR user
  },
  createdAt: DateTime
}
```

This provides a complete audit trail for compliance and review purposes.

## Security Notes

- API key is stored securely in environment variables (never in code)
- Only HR/ADMIN roles can access the endpoint
- All requests are authenticated via JWT
- Activity logging tracks all screening actions
- Resume text is not stored permanently (only processed in memory)

## Troubleshooting

### Issue: "AI service is not configured"
**Solution**: Ensure `ANTHROPIC_API_KEY` is set in your `.env` file and the server has been restarted.

### Issue: "Invalid response from AI service"
**Solution**: The AI response didn't match expected format. Check:
- API key is valid
- Network connectivity
- Resume text is properly formatted

### Issue: 403 Forbidden
**Solution**: Ensure the user has HR or ADMIN role assigned.

### Issue: High response times
**Solution**:
- AI API calls typically take 2-5 seconds
- Consider implementing a loading state in UI
- Use background job processing for bulk screening

## Future Enhancements

Potential improvements:
- Bulk resume screening endpoint
- Resume parsing from PDF/DOC files directly
- Custom screening criteria per job
- Machine learning feedback loop
- Skill gap analysis integration
- Automated candidate ranking
