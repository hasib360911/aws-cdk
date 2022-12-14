"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isCompleteHandler = exports.onEventHandler = void 0;
const aws_sdk_1 = require("aws-sdk"); // eslint-disable-line import/no-extraneous-dependencies
async function onEventHandler(event) {
    console.log('Event: %j', event);
    const rds = new aws_sdk_1.RDS();
    const physicalResourceId = `${event.ResourceProperties.DBClusterIdentifier}-${event.ResourceProperties.DBClusterIdentifier}`;
    if (event.RequestType === 'Create' || event.RequestType === 'Update') {
        const data = await rds.createDBClusterSnapshot({
            DBClusterIdentifier: event.ResourceProperties.DBClusterIdentifier,
            DBClusterSnapshotIdentifier: event.ResourceProperties.DBClusterSnapshotIdentifier,
        }).promise();
        return {
            PhysicalResourceId: physicalResourceId,
            Data: {
                DBClusterSnapshotArn: data.DBClusterSnapshot?.DBClusterSnapshotArn,
            },
        };
    }
    if (event.RequestType === 'Delete') {
        await rds.deleteDBClusterSnapshot({
            DBClusterSnapshotIdentifier: event.ResourceProperties.DBClusterSnapshotIdentifier,
        }).promise();
    }
    return {
        PhysicalResourceId: `${event.ResourceProperties.DBClusterIdentifier}-${event.ResourceProperties.DBClusterIdentifier}`,
    };
}
exports.onEventHandler = onEventHandler;
async function isCompleteHandler(event) {
    console.log('Event: %j', event);
    const snapshotStatus = await tryGetClusterSnapshotStatus(event.ResourceProperties.DBClusterSnapshotIdentifier);
    switch (event.RequestType) {
        case 'Create':
        case 'Update':
            return { IsComplete: snapshotStatus === 'available' };
        case 'Delete':
            return { IsComplete: snapshotStatus === undefined };
    }
}
exports.isCompleteHandler = isCompleteHandler;
async function tryGetClusterSnapshotStatus(identifier) {
    try {
        const rds = new aws_sdk_1.RDS();
        const data = await rds.describeDBClusterSnapshots({
            DBClusterSnapshotIdentifier: identifier,
        }).promise();
        return data.DBClusterSnapshots?.[0].Status;
    }
    catch (err) {
        if (err.code === 'DBClusterSnapshotNotFoundFault') {
            return undefined;
        }
        throw err;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFFQSxxQ0FBOEIsQ0FBQyx3REFBd0Q7QUFFaEYsS0FBSyxVQUFVLGNBQWMsQ0FBQyxLQUFxQjtJQUN4RCxPQUFPLENBQUMsR0FBRyxDQUFDLFdBQVcsRUFBRSxLQUFLLENBQUMsQ0FBQztJQUVoQyxNQUFNLEdBQUcsR0FBRyxJQUFJLGFBQUcsRUFBRSxDQUFDO0lBRXRCLE1BQU0sa0JBQWtCLEdBQUcsR0FBRyxLQUFLLENBQUMsa0JBQWtCLENBQUMsbUJBQW1CLElBQUksS0FBSyxDQUFDLGtCQUFrQixDQUFDLG1CQUFtQixFQUFFLENBQUM7SUFFN0gsSUFBSSxLQUFLLENBQUMsV0FBVyxLQUFLLFFBQVEsSUFBSSxLQUFLLENBQUMsV0FBVyxLQUFLLFFBQVEsRUFBRTtRQUNwRSxNQUFNLElBQUksR0FBRyxNQUFNLEdBQUcsQ0FBQyx1QkFBdUIsQ0FBQztZQUM3QyxtQkFBbUIsRUFBRSxLQUFLLENBQUMsa0JBQWtCLENBQUMsbUJBQW1CO1lBQ2pFLDJCQUEyQixFQUFFLEtBQUssQ0FBQyxrQkFBa0IsQ0FBQywyQkFBMkI7U0FDbEYsQ0FBQyxDQUFDLE9BQU8sRUFBRSxDQUFDO1FBQ2IsT0FBTztZQUNMLGtCQUFrQixFQUFFLGtCQUFrQjtZQUN0QyxJQUFJLEVBQUU7Z0JBQ0osb0JBQW9CLEVBQUUsSUFBSSxDQUFDLGlCQUFpQixFQUFFLG9CQUFvQjthQUNuRTtTQUNGLENBQUM7S0FDSDtJQUVELElBQUksS0FBSyxDQUFDLFdBQVcsS0FBSyxRQUFRLEVBQUU7UUFDbEMsTUFBTSxHQUFHLENBQUMsdUJBQXVCLENBQUM7WUFDaEMsMkJBQTJCLEVBQUUsS0FBSyxDQUFDLGtCQUFrQixDQUFDLDJCQUEyQjtTQUNsRixDQUFDLENBQUMsT0FBTyxFQUFFLENBQUM7S0FDZDtJQUVELE9BQU87UUFDTCxrQkFBa0IsRUFBRSxHQUFHLEtBQUssQ0FBQyxrQkFBa0IsQ0FBQyxtQkFBbUIsSUFBSSxLQUFLLENBQUMsa0JBQWtCLENBQUMsbUJBQW1CLEVBQUU7S0FDdEgsQ0FBQztBQUNKLENBQUM7QUE3QkQsd0NBNkJDO0FBRU0sS0FBSyxVQUFVLGlCQUFpQixDQUFDLEtBQXdCO0lBQzlELE9BQU8sQ0FBQyxHQUFHLENBQUMsV0FBVyxFQUFFLEtBQUssQ0FBQyxDQUFDO0lBRWhDLE1BQU0sY0FBYyxHQUFHLE1BQU0sMkJBQTJCLENBQUMsS0FBSyxDQUFDLGtCQUFrQixDQUFDLDJCQUEyQixDQUFDLENBQUM7SUFFL0csUUFBUSxLQUFLLENBQUMsV0FBVyxFQUFFO1FBQ3pCLEtBQUssUUFBUSxDQUFDO1FBQ2QsS0FBSyxRQUFRO1lBQ1gsT0FBTyxFQUFFLFVBQVUsRUFBRSxjQUFjLEtBQUssV0FBVyxFQUFFLENBQUM7UUFDeEQsS0FBSyxRQUFRO1lBQ1gsT0FBTyxFQUFFLFVBQVUsRUFBRSxjQUFjLEtBQUssU0FBUyxFQUFFLENBQUM7S0FDdkQ7QUFDSCxDQUFDO0FBWkQsOENBWUM7QUFFRCxLQUFLLFVBQVUsMkJBQTJCLENBQUMsVUFBa0I7SUFDM0QsSUFBSTtRQUNGLE1BQU0sR0FBRyxHQUFHLElBQUksYUFBRyxFQUFFLENBQUM7UUFDdEIsTUFBTSxJQUFJLEdBQUcsTUFBTSxHQUFHLENBQUMsMEJBQTBCLENBQUM7WUFDaEQsMkJBQTJCLEVBQUUsVUFBVTtTQUN4QyxDQUFDLENBQUMsT0FBTyxFQUFFLENBQUM7UUFDYixPQUFPLElBQUksQ0FBQyxrQkFBa0IsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQztLQUM1QztJQUFDLE9BQU8sR0FBRyxFQUFFO1FBQ1osSUFBSSxHQUFHLENBQUMsSUFBSSxLQUFLLGdDQUFnQyxFQUFFO1lBQ2pELE9BQU8sU0FBUyxDQUFDO1NBQ2xCO1FBQ0QsTUFBTSxHQUFHLENBQUM7S0FDWDtBQUNILENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKiBlc2xpbnQtZGlzYWJsZSBuby1jb25zb2xlICovXG5pbXBvcnQgdHlwZSB7IElzQ29tcGxldGVSZXF1ZXN0LCBJc0NvbXBsZXRlUmVzcG9uc2UsIE9uRXZlbnRSZXF1ZXN0LCBPbkV2ZW50UmVzcG9uc2UgfSBmcm9tICdAYXdzLWNkay9jdXN0b20tcmVzb3VyY2VzL2xpYi9wcm92aWRlci1mcmFtZXdvcmsvdHlwZXMnO1xuaW1wb3J0IHsgUkRTIH0gZnJvbSAnYXdzLXNkayc7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgaW1wb3J0L25vLWV4dHJhbmVvdXMtZGVwZW5kZW5jaWVzXG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBvbkV2ZW50SGFuZGxlcihldmVudDogT25FdmVudFJlcXVlc3QpOiBQcm9taXNlPE9uRXZlbnRSZXNwb25zZT4ge1xuICBjb25zb2xlLmxvZygnRXZlbnQ6ICVqJywgZXZlbnQpO1xuXG4gIGNvbnN0IHJkcyA9IG5ldyBSRFMoKTtcblxuICBjb25zdCBwaHlzaWNhbFJlc291cmNlSWQgPSBgJHtldmVudC5SZXNvdXJjZVByb3BlcnRpZXMuREJDbHVzdGVySWRlbnRpZmllcn0tJHtldmVudC5SZXNvdXJjZVByb3BlcnRpZXMuREJDbHVzdGVySWRlbnRpZmllcn1gO1xuXG4gIGlmIChldmVudC5SZXF1ZXN0VHlwZSA9PT0gJ0NyZWF0ZScgfHwgZXZlbnQuUmVxdWVzdFR5cGUgPT09ICdVcGRhdGUnKSB7XG4gICAgY29uc3QgZGF0YSA9IGF3YWl0IHJkcy5jcmVhdGVEQkNsdXN0ZXJTbmFwc2hvdCh7XG4gICAgICBEQkNsdXN0ZXJJZGVudGlmaWVyOiBldmVudC5SZXNvdXJjZVByb3BlcnRpZXMuREJDbHVzdGVySWRlbnRpZmllcixcbiAgICAgIERCQ2x1c3RlclNuYXBzaG90SWRlbnRpZmllcjogZXZlbnQuUmVzb3VyY2VQcm9wZXJ0aWVzLkRCQ2x1c3RlclNuYXBzaG90SWRlbnRpZmllcixcbiAgICB9KS5wcm9taXNlKCk7XG4gICAgcmV0dXJuIHtcbiAgICAgIFBoeXNpY2FsUmVzb3VyY2VJZDogcGh5c2ljYWxSZXNvdXJjZUlkLFxuICAgICAgRGF0YToge1xuICAgICAgICBEQkNsdXN0ZXJTbmFwc2hvdEFybjogZGF0YS5EQkNsdXN0ZXJTbmFwc2hvdD8uREJDbHVzdGVyU25hcHNob3RBcm4sXG4gICAgICB9LFxuICAgIH07XG4gIH1cblxuICBpZiAoZXZlbnQuUmVxdWVzdFR5cGUgPT09ICdEZWxldGUnKSB7XG4gICAgYXdhaXQgcmRzLmRlbGV0ZURCQ2x1c3RlclNuYXBzaG90KHtcbiAgICAgIERCQ2x1c3RlclNuYXBzaG90SWRlbnRpZmllcjogZXZlbnQuUmVzb3VyY2VQcm9wZXJ0aWVzLkRCQ2x1c3RlclNuYXBzaG90SWRlbnRpZmllcixcbiAgICB9KS5wcm9taXNlKCk7XG4gIH1cblxuICByZXR1cm4ge1xuICAgIFBoeXNpY2FsUmVzb3VyY2VJZDogYCR7ZXZlbnQuUmVzb3VyY2VQcm9wZXJ0aWVzLkRCQ2x1c3RlcklkZW50aWZpZXJ9LSR7ZXZlbnQuUmVzb3VyY2VQcm9wZXJ0aWVzLkRCQ2x1c3RlcklkZW50aWZpZXJ9YCxcbiAgfTtcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGlzQ29tcGxldGVIYW5kbGVyKGV2ZW50OiBJc0NvbXBsZXRlUmVxdWVzdCk6IFByb21pc2U8SXNDb21wbGV0ZVJlc3BvbnNlPiB7XG4gIGNvbnNvbGUubG9nKCdFdmVudDogJWonLCBldmVudCk7XG5cbiAgY29uc3Qgc25hcHNob3RTdGF0dXMgPSBhd2FpdCB0cnlHZXRDbHVzdGVyU25hcHNob3RTdGF0dXMoZXZlbnQuUmVzb3VyY2VQcm9wZXJ0aWVzLkRCQ2x1c3RlclNuYXBzaG90SWRlbnRpZmllcik7XG5cbiAgc3dpdGNoIChldmVudC5SZXF1ZXN0VHlwZSkge1xuICAgIGNhc2UgJ0NyZWF0ZSc6XG4gICAgY2FzZSAnVXBkYXRlJzpcbiAgICAgIHJldHVybiB7IElzQ29tcGxldGU6IHNuYXBzaG90U3RhdHVzID09PSAnYXZhaWxhYmxlJyB9O1xuICAgIGNhc2UgJ0RlbGV0ZSc6XG4gICAgICByZXR1cm4geyBJc0NvbXBsZXRlOiBzbmFwc2hvdFN0YXR1cyA9PT0gdW5kZWZpbmVkIH07XG4gIH1cbn1cblxuYXN5bmMgZnVuY3Rpb24gdHJ5R2V0Q2x1c3RlclNuYXBzaG90U3RhdHVzKGlkZW50aWZpZXI6IHN0cmluZyk6IFByb21pc2U8c3RyaW5nIHwgdW5kZWZpbmVkPiB7XG4gIHRyeSB7XG4gICAgY29uc3QgcmRzID0gbmV3IFJEUygpO1xuICAgIGNvbnN0IGRhdGEgPSBhd2FpdCByZHMuZGVzY3JpYmVEQkNsdXN0ZXJTbmFwc2hvdHMoe1xuICAgICAgREJDbHVzdGVyU25hcHNob3RJZGVudGlmaWVyOiBpZGVudGlmaWVyLFxuICAgIH0pLnByb21pc2UoKTtcbiAgICByZXR1cm4gZGF0YS5EQkNsdXN0ZXJTbmFwc2hvdHM/LlswXS5TdGF0dXM7XG4gIH0gY2F0Y2ggKGVycikge1xuICAgIGlmIChlcnIuY29kZSA9PT0gJ0RCQ2x1c3RlclNuYXBzaG90Tm90Rm91bmRGYXVsdCcpIHtcbiAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgfVxuICAgIHRocm93IGVycjtcbiAgfVxufVxuIl19