import {parse, buildSchema} from 'graphql';
import {plugin} from '../index';



const basicDoc = parse(/* GraphQL */ `
    subscription testQuery {
        feed {
            id
            commentCount
            repository {
                full_name
                html_url
                owner {
                    avatar_url
                }
            }
        }
    }
`);


const subscriptionDoc = parse(/* GraphQL */ `
    subscription testSubscription($name: String) {
        commentAdded(repoFullName: $name) {
            id
        }
    }
`);

describe('My Plugin', () => {


    const schema = buildSchema(/* GraphQL */ `
        type Query {
            workspacesWithPagination: String!
            workspaces: String!
            workspace: String!
        }

        type Mutation {
            workspaceCreate: WorkspaceCreateInput!
        }
        type PaginateInput {
            name: String
        }
        type WorkspaceCreateInput {
            ownerId: String
        }

    `);
    const docs = [
        {
            document: basicDoc,
        },
        // {
        //     document: basicMutation,
        // },
    ];

    const usedBefore = process.memoryUsage().heapUsed;

    it('Should greet', async () => {
        const result = await plugin(schema, docs, {
            // name: 'bear-react-query'
            omitOperationSuffix: true,
            exposeDocument: false,
            exposeQueryKeys: true,
            exposeQueryClientHook: true,
        });

        const usedAfter = process.memoryUsage().heapUsed;
        console.log(`Memory used by the function: ${(usedAfter - usedBefore) / 1024 / 1024} MB`);

        const testQueryDocument = `\`
    subscription testSubscription {
  feed {
    id
    commentCount
    repository {
      full_name
      html_url
      owner {
        avatar_url
      }
    }
  }
}
    \`;
export const useTestQuery = <
      TData = TestQuery,
      TError = unknown
    >(
      args?: IUseFetcherArgs<TestQueryVariables>,
      options?: Partial<UseQueryOptions<TestQuery, TError, TData>>
    ) =>
    useQuery<TestQuery, TError, TData>({
      queryKey: args?.variables ? ['testQuery', args.variables]: ['testQuery'],
      queryFn: fetch<TestQuery, IUseFetcherArgs<TestQueryVariables>>(TestQueryDocument, args),
      ...options
    });


`;

        expect(result).toStrictEqual({
            "content": `
export const TestQueryDocument = ${testQueryDocument}
`,
            "prepend": [
                "import {gql, useSubscription, SubscriptionHookOptions} from '@apollo/client';",
                null
            ]
        });
    });
});
