import {
  asNexusMethod,
  inputObjectType,
  makeSchema,
  mutationType,
  objectType,
  queryType
} from '@nexus/schema';
import { GraphQLDate } from 'graphql-iso-date';
import path from 'path';

export const GQLDate = asNexusMethod(GraphQLDate, 'date');

const Event = objectType({
  name: 'Event',
  definition(t) {
    t.id('id');
    t.string('name');
    t.date('startDate');
    t.date('endDate');
    t.string('description');
    t.string('organization');
    t.string('location');
    t.string('submitterName');
    t.string('submitterEmail');
  }
});

const Query = queryType({
  definition(t) {
    t.list.field('events', {
      type: 'Event',
      resolve: (_, args, ctx) => {
        return ctx.prisma.event.findMany();
      }
    });
  }
});

const EventInput = inputObjectType({
  name: 'EventInput',
  definition(t) {
    t.string('name', { required: true });
    t.date('startDate', { required: true });
    t.date('endDate', { required: true });
    t.string('description', { required: true });
    t.string('organization', { required: true });
    t.string('location', { required: true });
    t.string('submitterName', { required: true });
    t.string('submitterEmail', { required: true });
  }
});

const Mutation = mutationType({
  definition(t) {
    t.field('createEvent', {
      type: 'Event',
      args: {
        createEventInput: EventInput
      },
      resolve: (_, args, ctx) => {
        return ctx.prisma.event.create({
          data: {
            approved: false,
            ...args.createEventInput
          }
        });
      }
    });
  }
});

export const schema = makeSchema({
  types: [Query, Mutation, Event, EventInput, GQLDate],
  outputs: {
    typegen: path.join(process.cwd(), 'generated', 'nexus-typegen.ts'),
    schema: path.join(process.cwd(), 'generated', 'schema.graphql')
  },
  typegenAutoConfig: {
    contextType: 'Context.Context',
    sources: [
      {
        source: '@prisma/client',
        alias: 'prisma'
      },
      {
        source: path.join(process.cwd(), 'graphql', 'context.ts'),
        alias: 'Context'
      }
    ]
  }
});
