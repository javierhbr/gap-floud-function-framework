I'll help you generate curl commands for all the endpoints from the OpenAPI spec. Based on the truncated spec shown, I can see several endpoints that require either Basic Auth or Bearer Auth. I'll create curl commands for each endpoint:

1. **Login Endpoint** (Basic Auth):
```shell script
curl -X POST "https://YOUR_API_GATEWAY_HOSTNAME/api/chrome/login" \
  -H "Authorization: Basic BASE64_ENCODED_CREDENTIALS" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@test.com",
    "password": "ZAQ!2wsx",
    "channel": "extension"
}'
```

2. **Get Guest Message History** (Basic Auth):
```shell script
curl -X POST "https://YOUR_API_GATEWAY_HOSTNAME/api/chrome/guest-messages/history/{userId}" \
  -H "Authorization: Basic BASE64_ENCODED_CREDENTIALS" \
  -H "Content-Type: application/json"
```

3. **Get Member Message History** (Bearer Auth):
```shell script
curl -X POST "https://YOUR_API_GATEWAY_HOSTNAME/api/chrome/member-messages/history/{userId}" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

4. **Send Guest Message** (Bearer Auth):
```shell script
curl -X POST "https://YOUR_API_GATEWAY_HOSTNAME/api/chrome/guest-messages" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "your_message",
    "userId": "user_id"
  }'
```

5. **Send Member Message** (Bearer Auth):
```shell script
curl -X POST "https://YOUR_API_GATEWAY_HOSTNAME/api/chrome/member-messages" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "your_message",
    "userId": "user_id"
  }'
```

Notes:
- Replace `YOUR_API_GATEWAY_HOSTNAME` with your actual API gateway hostname
- For Basic Auth endpoints, replace `BASE64_ENCODED_CREDENTIALS` with the Base64-encoded string of `username:password`
- For Bearer Auth endpoints, replace `YOUR_JWT_TOKEN` with a valid JWT token
- Replace `{userId}` with an actual user ID when making requests
- The request body structures are simplified examples; adjust them according to your actual `ChatRequestApi` and `LoginRequest` schemas
- All endpoints use POST method as specified in the API spec
- Content-Type is set to application/json for all requests as per the spec

Would you like me to explain any specific part of these curl commands in more detail?



✔  functions: Loaded functions definitions from source: memberChat, loginApi, guestChat.
✔  functions[us-central1-memberChat]: http function initialized (http://127.0.0.1:5001/javierhbr-lab/us-central1/memberChat).
✔  functions[us-central1-loginApi]: http function initialized (http://127.0.0.1:5001/javierhbr-lab/us-central1/loginApi).
✔  functions[us-central1-guestChat]: http function initialized (http://127.0.0.1:5001/javierhbr-lab/us-central1/guestChat).



