#!/bin/bash

# Test script for AI Chatbot API
# Usage: ./test-chatbot.sh

BASE_URL="http://localhost:5000/api"
CONTENT_TYPE="Content-Type: application/json"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}=== Dayflow HRMS Chatbot API Test ===${NC}\n"

# Step 1: Login
echo -e "${YELLOW}Step 1: Login to get authentication token${NC}"
echo "POST $BASE_URL/auth/login"

LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "$CONTENT_TYPE" \
  -d '{
    "email": "admin@example.com",
    "password": "admin123"
  }')

TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*' | sed 's/"token":"//')

if [ -z "$TOKEN" ]; then
  echo -e "${RED}✗ Login failed. Check credentials or start the server.${NC}"
  echo "Response: $LOGIN_RESPONSE"
  exit 1
else
  echo -e "${GREEN}✓ Login successful${NC}"
  echo "Token: ${TOKEN:0:20}..."
fi

echo ""

# Step 2: Check chatbot status
echo -e "${YELLOW}Step 2: Check chatbot status${NC}"
echo "GET $BASE_URL/chatbot/status"

STATUS_RESPONSE=$(curl -s -X GET "$BASE_URL/chatbot/status" \
  -H "Authorization: Bearer $TOKEN")

echo "Response:"
echo "$STATUS_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$STATUS_RESPONSE"

# Check if chatbot is available
AVAILABLE=$(echo $STATUS_RESPONSE | grep -o '"available":[^,]*' | sed 's/"available"://')

if [ "$AVAILABLE" = "false" ]; then
  echo -e "${RED}✗ Chatbot not configured. Please set ANTHROPIC_API_KEY in .env${NC}"
  exit 1
else
  echo -e "${GREEN}✓ Chatbot is operational${NC}"
fi

echo ""

# Step 3: Test chatbot queries
echo -e "${YELLOW}Step 3: Test chatbot queries${NC}"

# Query 1: Leave balance
echo -e "\n${YELLOW}Query 1: Leave balance${NC}"
QUERY_1='{"query": "How many paid leave days do I have left?"}'

echo "POST $BASE_URL/chatbot/query"
echo "Body: $QUERY_1"

RESPONSE_1=$(curl -s -X POST "$BASE_URL/chatbot/query" \
  -H "$CONTENT_TYPE" \
  -H "Authorization: Bearer $TOKEN" \
  -d "$QUERY_1")

echo "Response:"
echo "$RESPONSE_1" | python3 -m json.tool 2>/dev/null || echo "$RESPONSE_1"

# Query 2: Work hours
echo -e "\n${YELLOW}Query 2: Work hours policy${NC}"
QUERY_2='{"query": "What are the office work hours?"}'

echo "POST $BASE_URL/chatbot/query"
echo "Body: $QUERY_2"

RESPONSE_2=$(curl -s -X POST "$BASE_URL/chatbot/query" \
  -H "$CONTENT_TYPE" \
  -H "Authorization: Bearer $TOKEN" \
  -d "$QUERY_2")

echo "Response:"
echo "$RESPONSE_2" | python3 -m json.tool 2>/dev/null || echo "$RESPONSE_2"

# Query 3: Salary information
echo -e "\n${YELLOW}Query 3: Salary information${NC}"
QUERY_3='{"query": "What is my current salary structure?"}'

echo "POST $BASE_URL/chatbot/query"
echo "Body: $QUERY_3"

RESPONSE_3=$(curl -s -X POST "$BASE_URL/chatbot/query" \
  -H "$CONTENT_TYPE" \
  -H "Authorization: Bearer $TOKEN" \
  -d "$QUERY_3")

echo "Response:"
echo "$RESPONSE_3" | python3 -m json.tool 2>/dev/null || echo "$RESPONSE_3"

# Step 4: Test error handling
echo -e "\n${YELLOW}Step 4: Test error handling${NC}"

# Empty query
echo -e "\n${YELLOW}Test: Empty query (should fail)${NC}"
EMPTY_QUERY='{"query": ""}'

echo "POST $BASE_URL/chatbot/query"
echo "Body: $EMPTY_QUERY"

ERROR_RESPONSE=$(curl -s -X POST "$BASE_URL/chatbot/query" \
  -H "$CONTENT_TYPE" \
  -H "Authorization: Bearer $TOKEN" \
  -d "$EMPTY_QUERY")

echo "Response:"
echo "$ERROR_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$ERROR_RESPONSE"

# Invalid token
echo -e "\n${YELLOW}Test: Invalid token (should fail with 401)${NC}"

INVALID_TOKEN_RESPONSE=$(curl -s -X POST "$BASE_URL/chatbot/query" \
  -H "$CONTENT_TYPE" \
  -H "Authorization: Bearer invalid-token-12345" \
  -d "$QUERY_1")

echo "Response:"
echo "$INVALID_TOKEN_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$INVALID_TOKEN_RESPONSE"

echo -e "\n${GREEN}=== Test completed ===${NC}"
echo -e "\n${YELLOW}Summary:${NC}"
echo "- Login: Success"
echo "- Status Check: Success"
echo "- Queries Tested: 3"
echo "- Error Cases Tested: 2"
echo ""
echo -e "${YELLOW}Note: Make sure to set ANTHROPIC_API_KEY in your .env file for full functionality${NC}"
