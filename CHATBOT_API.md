# AI Chatbot API Documentation

## Overview

The Dayflow HRMS AI Chatbot provides intelligent HR support using Claude AI (Anthropic). It answers employee questions about leave balances, attendance, payroll, and company policies using personalized context.

## Features

- **Personalized Responses**: Uses employee-specific data (leave history, attendance, salary)
- **Confidence Scoring**: Returns confidence level (high/medium/low) for each response
- **Policy Knowledge**: Pre-configured with company HR policies
- **Smart Fallback**: Redirects to HR when information is unavailable
- **Error Handling**: Comprehensive validation and error responses

## API Endpoints

### 1. Handle Chatbot Query

**Endpoint**: `POST /api/chatbot/query`

**Authentication**: Required (Bearer token)

**Request Body**:
```json
{
  "query": "How many paid leave days do I have left?",
  "userId": "optional-user-id"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "response": "Based on your records, you have used 5 paid leave days this year, so you have 7 days remaining out of your 12-day annual quota. All your leave requests have been approved.",
    "confidence": "high"
  }
}
```

**Confidence Levels**:
- `high`: Query matches employee data with specific information
- `medium`: General policy questions or partial data match
- `low`: Vague queries or insufficient context

### 2. Get Chatbot Status

**Endpoint**: `GET /api/chatbot/status`

**Authentication**: Required (Bearer token)

**Response**:
```json
{
  "success": true,
  "data": {
    "available": true,
    "model": "claude-sonnet-4-5-20250929",
    "status": "operational",
    "message": "Chatbot is ready to assist you"
  }
}
```

## Setup Instructions

### 1. Environment Configuration

Add your Anthropic API key to `.env`:

```bash
ANTHROPIC_API_KEY=your-anthropic-api-key-here
```

Get your API key from: https://console.anthropic.com/settings/keys

### 2. Install Dependencies

The Anthropic SDK is already included in `package.json`:

```bash
npm install
```

### 3. Start the Server

```bash
npm run dev
```

## Employee Context

The chatbot automatically includes the following employee information:

### Personal Information
- Full name, department, designation
- Employment type, joining date

### Leave Information
- Paid leave used/remaining (12 days annual quota)
- Sick leave used/remaining (7 days annual quota)
- Unpaid leave days
- Recent leave requests and their status

### Attendance Information
- Total days tracked
- Present/absent days
- Last 30 days of attendance

### Salary Information
- Basic salary, gross salary, net salary
- (Only if payroll data exists)

### Company Policies
- Leave policies (paid, sick, casual)
- Work hours and schedule
- Notice periods and requirements

## Example Queries

### Leave-Related
- "How many leave days do I have left?"
- "Can I take 3 days off next week?"
- "What's the status of my pending leave request?"

### Attendance-Related
- "What were my work hours yesterday?"
- "How many days was I absent this month?"
- "Do I need to mark attendance on weekends?"

### Payroll-Related
- "What's my current salary?"
- "How is my net salary calculated?"
- "When do I receive my salary?"

### Policy-Related
- "What are the office hours?"
- "How many sick leave days do I get?"
- "What's the notice period for resignation?"

## Error Handling

### Missing API Key
```json
{
  "success": false,
  "error": {
    "message": "Chatbot service is unavailable. Please contact your administrator.",
    "statusCode": 503
  }
}
```

### Invalid Query
```json
{
  "success": false,
  "error": {
    "message": "Validation error",
    "statusCode": 400,
    "details": [
      {
        "code": "too_small",
        "message": "Query cannot be empty"
      }
    ]
  }
}
```

### Employee Not Found
```json
{
  "success": false,
  "error": {
    "message": "Employee not found",
    "statusCode": 404
  }
}
```

## Implementation Details

### Files Created

1. **`server/src/controllers/chatbotController.ts`** (8.2 KB)
   - `handleChatbotQuery`: Main query handler
   - `getChatbotStatus`: Health check endpoint
   - Helper functions for confidence scoring and leave calculations

2. **`server/src/routes/chatbot.ts`** (452 bytes)
   - Route definitions with authentication middleware

3. **Updated Files**:
   - `server/src/index.ts`: Added chatbot router
   - `server/.env.example`: Added ANTHROPIC_API_KEY

### Architecture

```
┌─────────────┐
│   Client    │
└──────┬──────┘
       │ POST /api/chatbot/query
       │ { query, userId }
       ▼
┌─────────────────────┐
│  Auth Middleware    │ ← Validates JWT token
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│ chatbotController   │
│  - Validate input   │
│  - Fetch employee   │
│  - Build context    │
│  - Call Claude API  │
│  - Score confidence │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│   Anthropic API     │ ← Claude Sonnet 4.5
│  (Claude AI)        │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│   JSON Response     │
│  { response,        │
│    confidence }     │
└─────────────────────┘
```

### Security

- **Authentication Required**: All endpoints require valid JWT tokens
- **User Isolation**: Employees can only query their own data
- **API Key Protection**: Anthropic API key stored in environment variables
- **Input Validation**: Zod schemas validate all inputs
- **Error Sanitization**: Internal errors are not exposed to clients

### Performance

- **Response Time**: ~1-3 seconds (depends on Claude API)
- **Max Tokens**: 500 (configured for concise responses)
- **Rate Limiting**: Recommended to add rate limiting in production
- **Caching**: Consider caching employee context for repeated queries

## Testing

### Manual Testing with cURL

```bash
# 1. Login to get token
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"password123"}'

# 2. Query chatbot (replace TOKEN)
curl -X POST http://localhost:5000/api/chatbot/query \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{"query":"How many leave days do I have left?"}'

# 3. Check status
curl http://localhost:5000/api/chatbot/status \
  -H "Authorization: Bearer TOKEN"
```

### Integration Testing

Consider adding tests for:
- ✓ Valid query returns response with confidence
- ✓ Empty query returns validation error
- ✓ Missing API key returns 503 error
- ✓ Invalid token returns 401 error
- ✓ Different query types return appropriate confidence levels

## Production Considerations

1. **Rate Limiting**: Add rate limiting to prevent API quota exhaustion
   ```typescript
   import rateLimit from 'express-rate-limit';

   const chatbotLimiter = rateLimit({
     windowMs: 15 * 60 * 1000, // 15 minutes
     max: 50, // 50 requests per window
   });

   router.post('/query', authenticate, chatbotLimiter, handleChatbotQuery);
   ```

2. **Monitoring**: Log all queries for analytics
   - Track query types
   - Monitor response times
   - Analyze confidence distributions

3. **Caching**: Cache employee context to reduce database queries
   ```typescript
   // Use Redis or in-memory cache
   const cachedEmployee = await cache.get(`employee:${userId}`);
   ```

4. **Cost Optimization**:
   - Monitor Anthropic API usage
   - Consider using Claude Haiku for simpler queries
   - Implement query preprocessing to handle common questions without API calls

5. **Enhanced Context**: Add more data sources as needed
   - Performance reviews
   - Training history
   - Benefits information
   - Team structure

## Future Enhancements

- [ ] Multi-turn conversations (conversation history)
- [ ] Voice input support
- [ ] Multi-language support
- [ ] Sentiment analysis for escalation
- [ ] Integration with ticketing system
- [ ] Analytics dashboard for HR insights
- [ ] Fine-tuned responses for specific company culture

## Support

For issues or questions:
- Email: hr@dayflow.com
- Extension: 100
- GitHub: [Repository URL]

## License

MIT License - See LICENSE file for details
