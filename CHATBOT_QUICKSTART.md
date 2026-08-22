# AI Chatbot Quick Start Guide

## 🚀 Get Started in 3 Steps

### Step 1: Get Your API Key (2 minutes)

1. Visit [Anthropic Console](https://console.anthropic.com/settings/keys)
2. Sign up or login with your account
3. Click "Create Key"
4. Copy your API key (starts with `sk-ant-`)

### Step 2: Configure Environment (1 minute)

```bash
cd server

# Create .env file from example
cp .env.example .env

# Edit .env and add your API key
# ANTHROPIC_API_KEY=sk-ant-your-key-here
```

Or directly add it:
```bash
echo "ANTHROPIC_API_KEY=sk-ant-your-key-here" >> .env
```

### Step 3: Test It! (2 minutes)

```bash
# Start the server
npm run dev

# In another terminal, run the test script
bash test-chatbot.sh
```

## ✅ Verification Checklist

After setup, verify everything works:

- [ ] Server starts without errors
- [ ] GET `/api/chatbot/status` returns `"available": true`
- [ ] POST `/api/chatbot/query` returns AI responses
- [ ] Test script passes all checks

## 📋 Example Usage

### Using cURL

```bash
# 1. Login first
TOKEN=$(curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}' \
  | grep -o '"token":"[^"]*' | sed 's/"token":"//')

# 2. Ask a question
curl -X POST http://localhost:5000/api/chatbot/query \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"query":"How many leave days do I have left?"}'
```

### Response Example

```json
{
  "success": true,
  "data": {
    "response": "Based on your records, you have used 5 paid leave days this year, so you have 7 days remaining out of your 12-day annual quota.",
    "confidence": "high"
  }
}
```

## 🎯 Common Queries to Try

### Leave Management
```json
{"query": "How many paid leave days do I have left?"}
{"query": "Can I take 3 days off next week?"}
{"query": "What's the status of my leave request?"}
```

### Attendance
```json
{"query": "What were my work hours yesterday?"}
{"query": "How many days was I absent this month?"}
{"query": "Do I need to mark attendance on weekends?"}
```

### Payroll
```json
{"query": "What is my current salary?"}
{"query": "How is my net salary calculated?"}
{"query": "When do I receive my salary?"}
```

### Policies
```json
{"query": "What are the office hours?"}
{"query": "How many sick leave days do I get?"}
{"query": "What's the notice period for resignation?"}
```

## 🔍 Troubleshooting

### Issue: "Chatbot service is unavailable"

**Solution:**
1. Check that `ANTHROPIC_API_KEY` is set in `.env`
2. Verify the API key is valid (test at console.anthropic.com)
3. Restart the server after adding the key

### Issue: "Authentication required"

**Solution:**
1. Login first to get a JWT token
2. Include the token in Authorization header: `Bearer <token>`
3. Check token hasn't expired (7-day default)

### Issue: "Employee not found"

**Solution:**
1. Ensure the user has an associated employee record
2. Check database has employee data for the logged-in user
3. Run `npm run prisma:seed` if database is empty

### Issue: API rate limit errors

**Solution:**
1. Check your Anthropic account quota
2. Add rate limiting to prevent abuse (see CHATBOT_API.md)
3. Consider caching responses for common queries

## 📊 Monitoring

### Check Logs

```bash
# Server logs show all chatbot queries
npm run dev

# Look for:
# - Query text
# - Response time
# - API errors
```

### Monitor API Usage

1. Visit [Anthropic Console](https://console.anthropic.com/settings/usage)
2. Check token usage and costs
3. Set up usage alerts

## 🔐 Security Reminders

- ✅ Never commit `.env` file to git
- ✅ Never share your API key
- ✅ Use environment variables in production
- ✅ Rotate keys if exposed
- ✅ Monitor usage for anomalies

## 📚 Next Steps

1. **Read Full Documentation**: See `CHATBOT_API.md` for complete API reference
2. **Review Implementation**: Check `IMPLEMENTATION_SUMMARY.md` for architecture details
3. **Add Rate Limiting**: Prevent API quota exhaustion (see Production Considerations)
4. **Implement Caching**: Reduce database load and API calls
5. **Add Monitoring**: Track query patterns and response quality

## 💡 Tips for Best Results

### Query Tips
- Be specific ("How many paid leave days left?" vs "Leave?")
- Use natural language
- Ask one question at a time
- Include context when relevant

### Integration Tips
- Cache employee data to reduce database queries
- Preprocess common questions to avoid API calls
- Use webhooks for real-time updates
- Consider conversation history for follow-ups

### Cost Optimization
- Monitor tokens per query (avg: 300-500)
- Use Claude Haiku for simpler queries (10x cheaper)
- Implement query classification (simple vs complex)
- Cache responses for identical queries

## 🆘 Support

### Documentation
- API Reference: `CHATBOT_API.md`
- Implementation Details: `IMPLEMENTATION_SUMMARY.md`
- Project Documentation: `README.md`

### Contact
- HR Support: hr@dayflow.com
- Technical Issues: Create GitHub issue
- Emergency: Extension 100

## 🎉 Success Metrics

Your chatbot is working well if:
- ✅ 90%+ queries get meaningful responses
- ✅ Average response time < 3 seconds
- ✅ High confidence scores (>70% "high" confidence)
- ✅ Low HR escalation rate (<10%)
- ✅ Positive employee feedback

---

**Estimated Setup Time**: 5 minutes
**Difficulty**: Beginner
**Prerequisites**: Node.js, npm, running Dayflow HRMS server

Happy chatting! 🤖
