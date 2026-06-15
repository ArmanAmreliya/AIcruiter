import { gql } from '@apollo/client';

export const GET_DASHBOARD_DATA = gql`
  query GetDashboardData {
    me {
      id
      fullName
      companyName
      role
      aiCredits
      email
    }
    jobs {
      id
      title
      description
      status
      candidateCount
      createdAt
    }
    activities {
      id
      type
      message
      subtitle
      timestamp
      score
    }
  }
`;

export const FETCH_JOB_BY_ID = gql`
  query GetJob($id: ID!) {
    job(id: $id) {
      id
      title
      description
      status
      candidateCount
      createdAt
    }
  }
`;

export const CREATE_JOB = gql`
  mutation CreateJob($title: String!, $description: String!, $durationMinutes: Int, $interviewType: [String!]) {
    createJob(title: $title, description: $description, durationMinutes: $durationMinutes, interviewType: $interviewType) {
      id
      title
      description
      status
      createdAt
    }
  }
`;

export const UPDATE_JOB = gql`
  mutation UpdateJob($id: ID!, $title: String, $description: String, $durationMinutes: Int, $interviewType: [String!], $status: String) {
    updateJob(id: $id, title: $title, description: $description, durationMinutes: $durationMinutes, interviewType: $interviewType, status: $status) {
      id
      title
      description
      status
      createdAt
    }
  }
`;

export const DELETE_JOB = gql`
  mutation DeleteJob($id: ID!) {
    deleteJob(id: $id)
  }
`;

export const GET_CANDIDATES = gql`
  query GetCandidates($jobId: ID) {
    candidates(jobId: $jobId) {
      id
      name
      email
      status
      resumeUrl
      metaData
      overallScore
      createdAt
      job {
        title
      }
    }
  }
`;

export const UPDATE_CANDIDATE_STATUS = gql`
  mutation UpdateCandidateStatus($id: ID!, $status: String!) {
    updateCandidateStatus(id: $id, status: $status) {
      id
      status
    }
  }
`;

export const CREATE_CANDIDATE = gql`
  mutation CreateCandidate($jobId: ID!, $name: String!, $email: String!) {
    createCandidate(jobId: $jobId, name: $name, email: $email) {
      id
      name
      email
      status
      jobId
    }
  }
`;

export const UPDATE_CANDIDATE_INTERVIEW_STATUS = gql`
  mutation UpdateCandidateInterviewStatus($id: ID!, $status: String!, $metaData: String) {
    updateCandidateInterviewStatus(id: $id, status: $status, metaData: $metaData) {
      id
      status
      metaData
    }
  }
`;

export const GET_DEEPGRAM_TOKEN = gql`
  mutation GetDeepgramToken {
    getDeepgramToken
  }
`;
