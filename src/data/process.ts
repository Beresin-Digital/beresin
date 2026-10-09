/**
 * The five-step engagement flow shown on /services.
 *
 * Kept as data rather than markup so the numbering and the connector layout in
 * `Process.astro` can stay generic — reorder or add a step here and the section
 * follows, including the "01/02/03" numerals.
 *
 * Each step carries an `output` line: the concrete artefact the client has in
 * hand when that step closes. It is what turns a generic agency flowchart into
 * something a client can point at.
 */
export interface ProcessStep {
  title: string;
  description: string;
  /** What the client receives at the end of this step. */
  output: string;
}

export const processSteps: ProcessStep[] = [
  {
    title: 'Discussion & Mapping',
    description:
      'We listen first: who the users are, how the business process runs, and which part hurts the most today. No template is forced on you.',
    output: 'Needs summary & priority list',
  },
  {
    title: 'Proposal & Scope',
    description:
      'The scope, the sequence of work, and the cost breakdown are put in writing — so there are no surprises midway or at handover.',
    output: 'Proposal & formal quote',
  },
  {
    title: 'Design & Prototype',
    description:
      'Flows and screens are designed and approved first, before a line of code is written. You can try the prototype and give feedback at this stage.',
    output: 'Clickable prototype',
  },
  {
    title: 'Development & Testing',
    description:
      'The system is built in stages on a staging environment you can access, tested across screen sizes, and reviewed together before going live.',
    output: 'Testable build & staging access',
  },
  {
    title: 'Launch & Maintenance',
    description:
      'The system is deployed to production, your team is trained to use it, and the documentation is handed over. Ongoing support is available if you need it.',
    output: 'Live system, docs & training',
  },
];
