

Or if you want to keep the flexibility of specifying different targets, modify the script to:
```json
{
  "scripts": {
    "start": "functions-framework --source=build/ --target=$npm_config_target"
  }
}
```

And run it as you were trying to:
```shell script
npm run start --target=loginApi
```

The `functions-framework` command requires the `--target` parameter to specify which function to execute. The target should match the exported function name in your code.

Make sure that:
1. The function `loginApi` is properly exported in your code
2. The built files are present in the `build/` directory
3. The function name matches exactly with what's exported (case sensitive)

```shell script
npm run start --target=loginApi

npm run start --target=memberChat

npm run start --target=guestChat

```
