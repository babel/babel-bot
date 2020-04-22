# Setup

`babel-bot` uses AWS Lambda and AWS API Gateway to listen for and act on GitHub webhooks. When making changes to the bot, it is useful to setup a separate repository + Lambda function to try things in a test-like environment.

## Setup

### Prep

1. [Create an `AWS` Account](https://aws.amazon.com/resources/create-account/). **Note**: A credit/debit card will be required
2. Create a new GitHub repository that you will use for testing purposes

### Lambda

1. Visit the `Lambda` service section in the AWS Console
2. Click the `Create a Lambda Function` button, then choose `Blank Function` as the blueprint
3. Under `Configure Triggers`, click `Next`
4. Give your function a `Name` and `Description`, and set the `Runtime` to `Node.js 4.3`
5. Leave the `Lambda function code` with the default code (will be changed later)
6. Under `Lambda function handler and role`, choose, `Create a new role from template(s)`
7. For `Role name`, use an identifier you will remember (example: `BabelBotRole`)
8. For `Policy Templates`, choose `Simple Microservice Permissions`
9. Click `Next` at the bottom of the page
10. On the `Review` page, click `Create Function`

### API Gateway

1. Visit the `API Gateway` service section in the AWS Console
2. Click `Create API`
3. Enter `BabelBotAPI` for `API Name`, and enter anything for `Description`, then click `Create API`
4. On the page for your new API, click `Actions` >> `Create Resource`
5. For `Resource Name`, enter `Event`. Leave `Resource Path` as the default (`/event`). Then click `Create Resource`
6. On the page for the new resource, click `Actions` >> `Create Method`
7. Choose `POST`, then click the `✓` button. You will be redirected to a `Setup` page
8. Set `Integration Type` to `Lambda Function`.
9. For the `Lambda Region` field, you will need to set this to the region your function is in. You can find this by visiting your function in the `Lambda` console.
10. For the `Lambda Function` field, enter the name of the function you created. Then click `Save`
11. Verify you were redirected to a page with the title `/event - POST - Method Execution`. Then, click the `Integration Request` header
12. Click to expand the `Body Mapping Templates` header
13. Set the option for `When there are no templates defined (recommended)`
14. Click `Add mapping template`, enter `application/json`, then click the `✓` button
15. In the template field, copy/paste the following JSON, then click `Save`

    ```json
    {
        "signature": "$input.params('X-Hub-Signature')",
        "type": "$input.params('X-GitHub-Event')",
        "data" : $input.json('$')
    }
    ```

16. Under `Resources`, click `Actions` >> `Deploy API`
17. Select `Deployment Stage` >> `[New Stage]`
18. For `Stage Name`, enter `test`, then click `Deploy`.
19. The success page should show a `Invoke URL`. Save this, as it will be used during the `GitHub` setup

### GitHub

1. Navigate to your test repository
2. Visit `Settings` >> `Webhooks`, and click `Add Webhook`
3. In `Payload URL`, enter the `Invoke URL` you copied from the `API Gateway` setup step, and add `/event` to the end of it
4. In `Content type`, select `application/json`
5. On the CLI, run `ruby -rsecurerandom -e 'puts SecureRandom.hex(20)'`. Then add the value to the `Secret` field. **Important**: Save this value somewhere safe
6. Choose `Let me select individual events.`, and choose `Issues` and `Pull request`
7. Click `Add webhook`
8. Navigate to the [`Tokens`](https://github.com/settings/tokens) page in your `GitHub` account settings
9. Create a new API Token, and give it the `Repo` permissions. Make sure to save this token!

### CircleCI

1. Navigate to https://circleci.com/account/api and click "Create New Token", give it a name, and click "Add API Token".

### Final Steps

1. Go back to the `Lambda` dashboard in `AWS`, and click on your function to edit it
2. For `Code entry type`, choose `Upload a .ZIP file`
3. Run `yarn run package` in the root of this repository (make sure you've run `yarn` first), then upload the `function.zip` file in the root
4. Under `Environment variables`, add a variable for `GITHUB_API_KEY` and `GITHUB_SECRET`, using the values you setup in the `GitHub` section of this document
5. Under `Environment variables`, add a variable for `CIRCLECI_API_KEY`, using the values you setup in the `CircleCI` section of this document
6. Click `Save`

If everything was done correctly, your bot should now be live! To see the execution logs, you can click the `Monitoring` tab on your function page in `Lambda`, then click `View logs in CloudWatch`.
