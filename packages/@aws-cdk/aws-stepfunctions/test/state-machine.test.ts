import { Template } from '@aws-cdk/assertions';
import * as logs from '@aws-cdk/aws-logs';
import * as s3 from '@aws-cdk/aws-s3';
import * as cdk from '@aws-cdk/core';
import * as stepfunctions from '../lib';

describe('State Machine', () => {
  test('Instantiate Default State Machine', () => {
    // GIVEN
    const stack = new cdk.Stack();

    // WHEN
    new stepfunctions.StateMachine(stack, 'MyStateMachine', {
      stateMachineName: 'MyStateMachine',
      definition: stepfunctions.Chain.start(new stepfunctions.Pass(stack, 'Pass')),
    });

    // THEN
    Template.fromStack(stack).hasResourceProperties('AWS::StepFunctions::StateMachine', {
      StateMachineName: 'MyStateMachine',
      DefinitionString: '{"StartAt":"Pass","States":{"Pass":{"Type":"Pass","End":true}}}',
    });
  }),

  test('Instantiate Standard State Machine', () => {
    // GIVEN
    const stack = new cdk.Stack();

    // WHEN
    new stepfunctions.StateMachine(stack, 'MyStateMachine', {
      stateMachineName: 'MyStateMachine',
      definition: stepfunctions.Chain.start(new stepfunctions.Pass(stack, 'Pass')),
      stateMachineType: stepfunctions.StateMachineType.STANDARD,
    });

    // THEN
    Template.fromStack(stack).hasResourceProperties('AWS::StepFunctions::StateMachine', {
      StateMachineName: 'MyStateMachine',
      StateMachineType: 'STANDARD',
      DefinitionString: '{"StartAt":"Pass","States":{"Pass":{"Type":"Pass","End":true}}}',
    });

  }),

  test('Instantiate Express State Machine', () => {
    // GIVEN
    const stack = new cdk.Stack();

    // WHEN
    new stepfunctions.StateMachine(stack, 'MyStateMachine', {
      stateMachineName: 'MyStateMachine',
      definition: stepfunctions.Chain.start(new stepfunctions.Pass(stack, 'Pass')),
      stateMachineType: stepfunctions.StateMachineType.EXPRESS,
    });

    // THEN
    Template.fromStack(stack).hasResourceProperties('AWS::StepFunctions::StateMachine', {
      StateMachineName: 'MyStateMachine',
      StateMachineType: 'EXPRESS',
      DefinitionString: '{"StartAt":"Pass","States":{"Pass":{"Type":"Pass","End":true}}}',
    });

  }),

  test('State Machine with invalid name', () => {
    // GIVEN
    const stack = new cdk.Stack();

    // WHEN
    const createStateMachine = (name: string) => {
      new stepfunctions.StateMachine(stack, name + 'StateMachine', {
        stateMachineName: name,
        definition: stepfunctions.Chain.start(new stepfunctions.Pass(stack, name + 'Pass')),
        stateMachineType: stepfunctions.StateMachineType.EXPRESS,
      });
    };
    const tooShortName = '';
    const tooLongName = 'M'.repeat(81);
    const invalidCharactersName = '*';

    // THEN
    expect(() => {
      createStateMachine(tooShortName);
    }).toThrow(`State Machine name must be between 1 and 80 characters. Received: ${tooShortName}`);

    expect(() => {
      createStateMachine(tooLongName);
    }).toThrow(`State Machine name must be between 1 and 80 characters. Received: ${tooLongName}`);

    expect(() => {
      createStateMachine(invalidCharactersName);
    }).toThrow(`State Machine name must match "^[a-z0-9+!@.()-=_']+$/i". Received: ${invalidCharactersName}`);
  });

  test('State Machine with valid name', () => {
    // GIVEN
    const stack = new cdk.Stack();
    const newStateMachine = new stepfunctions.StateMachine(stack, 'dummyStateMachineToken', {
      definition: stepfunctions.Chain.start(new stepfunctions.Pass(stack, 'dummyStateMachineTokenPass')),
    });

    // WHEN
    const nameContainingToken = newStateMachine.stateMachineName + '-Name';
    const validName = 'AWS-Stepfunctions_Name.Test(@aws-cdk+)!=\'1\'';

    // THEN
    expect(() => {
      new stepfunctions.StateMachine(stack, 'TokenTest-StateMachine', {
        stateMachineName: nameContainingToken,
        definition: stepfunctions.Chain.start(new stepfunctions.Pass(stack, 'TokenTest-StateMachinePass')),
        stateMachineType: stepfunctions.StateMachineType.EXPRESS,
      });
    }).not.toThrow();

    expect(() => {
      new stepfunctions.StateMachine(stack, 'ValidNameTest-StateMachine', {
        stateMachineName: validName,
        definition: stepfunctions.Chain.start(new stepfunctions.Pass(stack, 'ValidNameTest-StateMachinePass')),
        stateMachineType: stepfunctions.StateMachineType.EXPRESS,
      });
    }).not.toThrow();
  });

  test('log configuration', () => {
    // GIVEN
    const stack = new cdk.Stack();

    // WHEN
    const logGroup = new logs.LogGroup(stack, 'MyLogGroup');

    new stepfunctions.StateMachine(stack, 'MyStateMachine', {
      definition: stepfunctions.Chain.start(new stepfunctions.Pass(stack, 'Pass')),
      logs: {
        destination: logGroup,
        level: stepfunctions.LogLevel.FATAL,
        includeExecutionData: false,
      },
    });

    // THEN
    Template.fromStack(stack).hasResourceProperties('AWS::StepFunctions::StateMachine', {
      DefinitionString: '{"StartAt":"Pass","States":{"Pass":{"Type":"Pass","End":true}}}',
      LoggingConfiguration: {
        Destinations: [{
          CloudWatchLogsLogGroup: {
            LogGroupArn: {
              'Fn::GetAtt': ['MyLogGroup5C0DAD85', 'Arn'],
            },
          },
        }],
        IncludeExecutionData: false,
        Level: 'FATAL',
      },
    });

    Template.fromStack(stack).hasResourceProperties('AWS::IAM::Policy', {
      PolicyDocument: {
        Statement: [{
          Action: [
            'logs:CreateLogDelivery',
            'logs:GetLogDelivery',
            'logs:UpdateLogDelivery',
            'logs:DeleteLogDelivery',
            'logs:ListLogDeliveries',
            'logs:PutResourcePolicy',
            'logs:DescribeResourcePolicies',
            'logs:DescribeLogGroups',
          ],
          Effect: 'Allow',
          Resource: '*',
        }],
        Version: '2012-10-17',
      },
      PolicyName: 'MyStateMachineRoleDefaultPolicyE468EB18',
      Roles: [
        {
          Ref: 'MyStateMachineRoleD59FFEBC',
        },
      ],
    });
  });

  test('tracing configuration', () => {
    // GIVEN
    const stack = new cdk.Stack();

    // WHEN
    new stepfunctions.StateMachine(stack, 'MyStateMachine', {
      definition: stepfunctions.Chain.start(new stepfunctions.Pass(stack, 'Pass')),
      tracingEnabled: true,
    });

    // THEN
    Template.fromStack(stack).hasResourceProperties('AWS::StepFunctions::StateMachine', {
      DefinitionString: '{"StartAt":"Pass","States":{"Pass":{"Type":"Pass","End":true}}}',
      TracingConfiguration: {
        Enabled: true,
      },
    });

    Template.fromStack(stack).hasResourceProperties('AWS::IAM::Policy', {
      PolicyDocument: {
        Statement: [{
          Action: [
            'xray:PutTraceSegments',
            'xray:PutTelemetryRecords',
            'xray:GetSamplingRules',
            'xray:GetSamplingTargets',
          ],
          Effect: 'Allow',
          Resource: '*',
        }],
        Version: '2012-10-17',
      },
      PolicyName: 'MyStateMachineRoleDefaultPolicyE468EB18',
      Roles: [
        {
          Ref: 'MyStateMachineRoleD59FFEBC',
        },
      ],
    });
  });

  test('grant access', () => {
    // GIVEN
    const stack = new cdk.Stack();

    // WHEN
    const sm = new stepfunctions.StateMachine(stack, 'MyStateMachine', {
      definition: stepfunctions.Chain.start(new stepfunctions.Pass(stack, 'Pass')),
    });
    const bucket = new s3.Bucket(stack, 'MyBucket');
    bucket.grantRead(sm);

    // THEN
    Template.fromStack(stack).hasResourceProperties('AWS::IAM::Policy', {
      PolicyDocument: {
        Statement: [
          {
            Action: [
              's3:GetObject*',
              's3:GetBucket*',
              's3:List*',
            ],
            Effect: 'Allow',
            Resource: [
              {
                'Fn::GetAtt': [
                  'MyBucketF68F3FF0',
                  'Arn',
                ],
              },
              {
                'Fn::Join': [
                  '',
                  [
                    {
                      'Fn::GetAtt': [
                        'MyBucketF68F3FF0',
                        'Arn',
                      ],
                    },
                    '/*',
                  ],
                ],
              },
            ],
          },
        ],
        Version: '2012-10-17',
      },
      PolicyName: 'MyStateMachineRoleDefaultPolicyE468EB18',
      Roles: [
        {
          Ref: 'MyStateMachineRoleD59FFEBC',
        },
      ],
    });
  });

  describe('StateMachine.fromStateMachineArn()', () => {
    let stack: cdk.Stack;

    beforeEach(() => {
      const app = new cdk.App();
      stack = new cdk.Stack(app, 'Base', {
        env: { account: '111111111111', region: 'stack-region' },
      });
    });

    describe('for a state machine in a different account and region', () => {
      let mach: stepfunctions.IStateMachine;

      beforeEach(() => {
        mach = stepfunctions.StateMachine.fromStateMachineArn(
          stack,
          'iMach',
          'arn:aws:states:machine-region:222222222222:stateMachine:machine-name',
        );
      });

      test("the state machine's region is taken from the ARN", () => {
        expect(mach.env.region).toBe('machine-region');
      });

      test("the state machine's account is taken from the ARN", () => {
        expect(mach.env.account).toBe('222222222222');
      });
    });
  });

  describe('StateMachine.fromStateMachineName()', () => {
    let stack: cdk.Stack;

    beforeEach(() => {
      const app = new cdk.App();
      stack = new cdk.Stack(app, 'Base', {
        env: { account: '111111111111', region: 'stack-region' },
      });
    });

    describe('for a state machine in the same account and region', () => {
      let mach: stepfunctions.IStateMachine;

      beforeEach(() => {
        mach = stepfunctions.StateMachine.fromStateMachineName(
          stack,
          'iMach',
          'machine-name',
        );
      });

      test("the state machine's region is taken from the current stack", () => {
        expect(mach.env.region).toBe('stack-region');
      });

      test("the state machine's account is taken from the current stack", () => {
        expect(mach.env.account).toBe('111111111111');
      });

      test("the state machine's account is taken from the current stack", () => {
        expect(mach.stateMachineArn.endsWith(':states:stack-region:111111111111:stateMachine:machine-name')).toBeTruthy();
      });
    });
  });
});
