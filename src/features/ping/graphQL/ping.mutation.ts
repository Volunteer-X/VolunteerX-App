import { gql } from '@app/__generated__/gql';

const CREATE_PING = gql(`
mutation createPing($createPingInput: CreatePingInput!) {
    createPing(createPingInput: $createPingInput) {
        id
        title
        description
        createdAt
    }
    }
    `);

export { CREATE_PING };