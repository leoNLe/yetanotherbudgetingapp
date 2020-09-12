# Yet Another Budgeting App (Y.A.B.A) 
Budgeting application that tracks users income and expenses.  Incomes and expenses will be categorized and compares against a budgeted amount user set.
Application was built using Node.js, Express.js, Mongoose, and React.

## Link to deploy application
[Y.A.B.A](https://yaba-1.herokuapp.com/)

## Table of Contents
* [Installation](#installation) 
* [Usage](#usage)
* [Questions](#questions)

## Installation

Scripts
```

npm i
	
npm start 
```

Deploy environmental variables:

```	

SMTP_HOST: SMTP host.  Provided by the email provider
SMTP_IS_SECURE: True/False
SMTP_USER: Email used to send confirmation email
SMT_PASS: Password to SMTP_USER email
SMTP_PORT: Specify port use for SMTP

```


For information on API routes please refer to [API Routes](README-api.md) 


## Usage
	
### Creating an account and verifying email address.

![](./api-readme-images/yaba-signup.gif)

### Enter expense and income.

![](./api-readme-images/yaba-add-categories-1.gif)

### Create budget by create Category and Category group with a allotment of budget amount to a category.

![](./api-readme-images/yaba-add-categories.gif)

## Questions 
If you have any questions about the repo, open the issue or contact [LeoNLe](https://github.com/leoNle) directly at lnle125@gmail.com

	
