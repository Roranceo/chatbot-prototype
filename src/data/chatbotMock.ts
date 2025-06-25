export interface Response {
  text: string;
  code: string;
  sender: 'user' | 'bot';
}

const responses: Record<string, Response> = {
  "how do i enable guardduty": {
    text: "To enable AWS GuardDuty, you'll need to configure it in your AWS Management Console. Here's how to do it:",
    code: `# Enable GuardDuty
aws guardduty create-detector \
  --enable \
  --finding-publishing-frequency FIFTEEN_MINUTES \
  --data-sources S3Logs={Enable=true} \
  --region us-east-1`,
    sender: 'bot'
  },
  "how do i set up sso": {
    text: "Setting up AWS SSO involves configuring your identity provider and creating permission sets. Here's the basic setup:",
    code: `# Create AWS SSO instance
aws sso-admin create-instance \
  --name "MySSOInstance" \
  --region us-east-1

# Create permission set
aws sso-admin create-permission-set \
  --instance-arn "arn:aws:sso:::instance/ssoins-xxxxxxxxxxxxx" \
  --name "AdministratorAccess" \
  --description "Provides full access to AWS services" \
  --session-duration "PT8H"`,
    sender: 'bot'
  },
  "how do i configure dns": {
    text: "To configure DNS in AWS Route 53, you'll need to create a hosted zone and add records. Here's an example:",
    code: `# Create hosted zone
aws route53 create-hosted-zone \
  --name "example.com" \
  --caller-reference "2024-03-20-01"

# Add A record
aws route53 change-resource-record-sets \
  --hosted-zone-id "ZXXXXXXXXXXXXX" \
  --change-batch '{
    "Changes": [{
      "Action": "CREATE",
      "ResourceRecordSet": {
        "Name": "example.com",
        "Type": "A",
        "TTL": 300,
        "ResourceRecords": [{"Value": "192.0.2.1"}]
      }
    }]
  }'`,
    sender: 'bot'
  },
  "how do i add cost control": {
    text: "To implement cost controls in AWS, you can set up budgets and alerts. Here's how to create a monthly budget:",
    code: `# Create budget
aws budgets create-budget \
  --account-id 123456789012 \
  --budget '{
    "BudgetName": "MonthlyBudget",
    "BudgetLimit": {
      "Amount": "1000",
      "Unit": "USD"
    },
    "BudgetType": "COST",
    "TimeUnit": "MONTHLY"
  }'

# Create budget notification
aws budgets create-notification \
  --account-id 123456789012 \
  --budget-name "MonthlyBudget" \
  --notification '{
    "NotificationType": "ACTUAL",
    "ComparisonOperator": "GREATER_THAN",
    "Threshold": 80,
    "ThresholdType": "PERCENTAGE",
    "NotificationState": "ALARM"
  }'`,
    sender: 'bot'
  },
  "how do i manage accounts": {
    text: "To manage AWS accounts using AWS Organizations, you can create and organize accounts. Here's how:",
    code: `# Create organization
aws organizations create-organization \
  --feature-set ALL

# Create account
aws organizations create-account \
  --email "admin@example.com" \
  --account-name "Development" \
  --role-name "OrganizationAccountAccessRole" \
  --iam-user-access-to-billing DENY`,
    sender: 'bot'
  },
  "how do i assign different permission sets to two teams of users across multiple aws account": {
    text: `To assign different permission sets to two teams of users across multiple AWS accounts, you can use Chatbot's PermissionSets. Here's how:

1. Define permission sets for each team
2. Assign the permission sets to the appropriate AWS accounts
3. Map users to their respective teams

Would you like to see how the code implementation works?`,
    code: `// 🔧 Update targetGroups and managedPolicies with your team-specific values.

const teamA = new PermissionSets(this, 'TeamAPermissionSet', {
  instanceArn,
  permissionSetName: 'TeamAAccess',
  managedPolicies: ['arn:aws:iam::aws:policy/PowerUserAccess'],
  targetGroups: ['TeamA']
});

const teamB = new PermissionSets(this, 'TeamBPermissionSet', {
  instanceArn,
  permissionSetName: 'TeamBAccess',
  managedPolicies: ['arn:aws:iam::aws:policy/ViewOnlyAccess'],
  targetGroups: ['TeamB']
});`,
    sender: 'bot'
  },
  "how do i assign different permission sets to two teams of users across multiple aws accounts": {
    text: `To assign different permission sets to two teams of users across multiple AWS accounts, you can use Chatbot's PermissionSets. Here's how:

1. Define permission sets for each team
2. Assign the permission sets to the appropriate AWS accounts
3. Map users to their respective teams

Would you like to see how the code implementation works?`,
    code: `// 🔧 Update targetGroups and managedPolicies with your team-specific values.

const teamA = new PermissionSets(this, 'TeamAPermissionSet', {
  instanceArn,
  permissionSetName: 'TeamAAccess',
  managedPolicies: ['arn:aws:iam::aws:policy/PowerUserAccess'],
  targetGroups: ['TeamA']
});

const teamB = new PermissionSets(this, 'TeamBPermissionSet', {
  instanceArn,
  permissionSetName: 'TeamBAccess',
  managedPolicies: ['arn:aws:iam::aws:policy/ViewOnlyAccess'],
  targetGroups: ['TeamB']
});`,
    sender: 'bot'
  }
};

export function getResponse(question: string): Response {
  const normalizedQuestion = question.toLowerCase().replace(/\s+/g, ' ').trim();
  
  console.log('Normalized question:', normalizedQuestion);
  console.log('Available responses:', Object.keys(responses));
  
  const defaultResponse: Response = {
    text: "I'm sorry, I don't have information about that topic yet. Please try asking about GuardDuty, SSO, DNS, cost control, or account management.",
    code: `# Example placeholder code
echo "No specific code available for this query"
# Please try one of the supported topics:
# - GuardDuty setup
# - SSO configuration
# - DNS management
# - Cost control
# - Account management`,
    sender: 'bot'
  };

  if (responses[normalizedQuestion]) {
    return responses[normalizedQuestion];
  }

  const permissionSetsVariations = [
    'how do i assign different permission sets to two teams of users across multiple aws account',
    'how do i assign different permission sets to two teams of users across multiple aws accounts',
    'how do i sign different permission sets to two teams of users across multiple aws account',
    'how do i sign different permission sets to two teams of users across multiple aws accounts',
    'how do i send different permission sets to two teams of users across multiple aws account',
    'how do i send different permission sets to two teams of users across multiple aws accounts'
  ];

  if (permissionSetsVariations.some(variation => normalizedQuestion.includes(variation))) {
    return responses['how do i assign different permission sets to two teams of users across multiple aws account'];
  }

  return defaultResponse;
}

export default responses;