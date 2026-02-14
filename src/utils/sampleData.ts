export const SAMPLE_JSON = {
  company: {
    name: 'DevGraph Technologies',
    founded: 2024,
    isPublic: false,
    headquarters: {
      city: 'San Francisco',
      state: 'California',
      country: 'USA',
      coordinates: {
        lat: 37.7749,
        lng: -122.4194,
      },
    },
    departments: [
      {
        name: 'Engineering',
        headcount: 45,
        lead: {
          name: 'Alice Chen',
          title: 'VP of Engineering',
          email: 'alice@devgraph.io',
        },
        teams: ['Frontend', 'Backend', 'DevOps', 'QA'],
      },
      {
        name: 'Design',
        headcount: 12,
        lead: {
          name: 'Bob Rivera',
          title: 'Head of Design',
          email: 'bob@devgraph.io',
        },
        teams: ['UI/UX', 'Brand', 'Research'],
      },
      {
        name: 'Product',
        headcount: 8,
        lead: {
          name: 'Carol Wu',
          title: 'CPO',
          email: 'carol@devgraph.io',
        },
        teams: ['Strategy', 'Analytics'],
      },
    ],
    products: [
      {
        name: 'DevGraph Visualizer',
        version: '2.1.0',
        active: true,
        features: [
          'JSON Visualization',
          'Format Conversion',
          'Code Generation',
          'Export',
        ],
      },
      {
        name: 'DevGraph API',
        version: '1.0.0',
        active: false,
        features: null,
      },
    ],
    metrics: {
      revenue: 2500000,
      customers: 1200,
      nps: 72,
      growthRate: 0.35,
    },
  },
};

export const SAMPLE_JSON_STRING = JSON.stringify(SAMPLE_JSON, null, 2);
