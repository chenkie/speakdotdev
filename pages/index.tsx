import React from 'react';
import Link from 'next/link';
import { PrismaClient } from '@prisma/client';
import { useMutation, gql } from '@apollo/client';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';

const formatAsDate = (date: string): string => {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

const CREATE_EVENT_MUTATION = gql`
  mutation createEventMutation($createEventInput: EventInput) {
    createEvent(createEventInput: $createEventInput) {
      id
      name
      description
      organization
      startDate
      endDate
      submitterName
      submitterEmail
      location
    }
  }
`;

const prisma = new PrismaClient();

type Event = {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  description: string;
  organization: string;
  location: string;
};

const Navbar: React.FC = props => {
  return (
    <nav className="bg-purple-700 h-16 mb-6 flex">
      <p className="text-purple-200 font-extrabold text-3xl m-auto">
        speak.dev
      </p>
    </nav>
  );
};

interface EventListingProps {
  event: Event;
}

const EventListing: React.FC<EventListingProps> = props => {
  return (
    <div>
      <h2 className="text-purple-700 font-semibold text-2xl">
        {props.event.name}
      </h2>
      <p className="text-gray-500 italic">{props.event.organization}</p>
      <p className="text-gray-800 mt-4">{props.event.description}</p>
      <div className="flex mt-10">
        <p className="mr-2">
          {formatAsDate(props.event.startDate)} -{' '}
          {formatAsDate(props.event.endDate)}
        </p>
        <p className="bg-purple-300 text-purple-700 rounded-full px-2 text-sm my-auto">
          {props.event.location}
        </p>
      </div>
    </div>
  );
};

export async function getServerSideProps(context) {
  const events = await prisma.event.findMany({
    where: {
      approved: {
        equals: true
      }
    }
  });

  return {
    props: {
      events: events.map(e => {
        return {
          ...e,
          startDate: String(e.startDate),
          endDate: String(e.endDate)
        };
      })
    }
  };
}

interface FormFieldProps {
  name: string;
  type: string;
  placeholder?: string;
  component?: string;
  rows?: string;
  cols?: string;
}

const FormField: React.FC<FormFieldProps> = props => {
  return (
    <Field {...props} className="bg-gray-100 w-full rounded-md h-10 p-2" />
  );
};

interface FormLabelProps {
  label: string;
}

const FormLabel: React.FC<FormLabelProps> = props => {
  return (
    <label className="text-gray-600 text-sm uppercase font-semibold">
      {props.label}
    </label>
  );
};

interface FormGroupProps {
  children: React.ReactNode;
}

const FormGroup: React.FC<FormGroupProps> = props => {
  return <div className="my-4">{props.children}</div>;
};

interface FormErrorProps {
  error: string;
}
const FormError: React.FC<FormErrorProps> = props => {
  return <p className="text-red-500 italic text-sm">{props.error}</p>;
};
const EventFormSchema = Yup.object().shape({
  name: Yup.string().required('Name is required'),
  description: Yup.string()
    .max(1000, 'Description is limited to 1000 characters')
    .required('Description is required'),
  startDate: Yup.date().required('Start Date is required'),
  endDate: Yup.date().required('End Date is required'),
  organization: Yup.string().required('Organization is required'),
  submitterName: Yup.string().required('Your name is required'),
  submitterEmail: Yup.string()
    .email('Invalid email')
    .required('Your email is required'),
  location: Yup.string().required()
});

const CreateEventForm: React.FC = props => {
  const [createEvent, { data, loading, error }] = useMutation(
    CREATE_EVENT_MUTATION
  );
  return (
    <div className="">
      <Formik
        initialValues={{
          name: '',
          description: '',
          startDate: '',
          endDate: '',
          organization: '',
          submitterName: '',
          submitterEmail: '',
          location: ''
        }}
        validationSchema={EventFormSchema}
        onSubmit={values =>
          createEvent({ variables: { createEventInput: values } })
        }
      >
        {({ errors, touched }) => (
          <Form>
            <FormGroup>
              <FormLabel label="Event Name" />
              <FormField name="name" type="text" placeholder="JS Conf" />

              {errors.name && touched.name && <FormError error={errors.name} />}
            </FormGroup>
            <FormGroup>
              <FormLabel label="Event Organization" />
              <FormField
                name="organization"
                type="text"
                placeholder="FancyEvents Co"
              />
              {errors.organization && touched.organization && (
                <FormError error={errors.organization} />
              )}
            </FormGroup>
            <FormGroup>
              <FormLabel label="Event Description" />
              <FormField
                name="description"
                type="text"
                component="textarea"
                cols="20"
                rows="20"
                placeholder="The best JS Conf in the world"
              />
              {errors.description && touched.description && (
                <FormError error={errors.description} />
              )}
            </FormGroup>
            <FormGroup>
              <FormLabel label="Start Date" />
              <FormField name="startDate" type="date" />
              {errors.startDate && touched.startDate && (
                <FormError error={errors.startDate} />
              )}
            </FormGroup>
            <FormGroup>
              <FormLabel label="End Date" />
              <FormField name="endDate" type="date" />
              {errors.endDate && touched.endDate && (
                <FormError error={errors.endDate} />
              )}
            </FormGroup>
            <FormGroup>
              <FormLabel label="Event Location" />
              <FormField name="location" type="text" placeholder="Online" />
              {errors.location && touched.location && (
                <FormError error={errors.location} />
              )}
            </FormGroup>
            <FormGroup>
              <FormLabel label="Your Name" />
              <FormField
                name="submitterName"
                type="text"
                placeholder="John Doe"
              />
              {errors.submitterName && touched.submitterName && (
                <FormError error={errors.submitterName} />
              )}
            </FormGroup>
            <FormGroup>
              <FormLabel label="Your Email" />
              <FormField
                name="submitterEmail"
                type="text"
                placeholder="john@doe.com"
              />
              {errors.submitterEmail && touched.submitterEmail && (
                <FormError error={errors.submitterEmail} />
              )}
            </FormGroup>
            <button
              type="submit"
              className="px-4 py-2 bg-purple-500 text-purple-100 rounded-full hover:bg-purple-600"
            >
              Submit
            </button>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default function Home(props) {
  return (
    <div className="">
      <Navbar />
      <div className="container mx-auto">
        <div className="flex">
          <div className="shadow-md bg-white rounded-lg p-8 w-3/4 mr-8">
            {props.events &&
              props.events.map((event: Event) => (
                <div
                  className="mb-8 border-b border-gray-100 pb-4"
                  key={event.id}
                >
                  <EventListing event={event} />
                </div>
              ))}
          </div>
          <div className="shadow-md bg-white rounded-lg p-8 w-1/4">
            <p className="text-gray-800 font-semibold">Submit an Event</p>
            <CreateEventForm />
          </div>
        </div>
      </div>
    </div>
  );
}
