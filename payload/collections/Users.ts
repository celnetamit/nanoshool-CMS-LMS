import type { CollectionConfig } from 'payload'

export const Users: CollectionConfig = {
  slug: 'users',
  auth: true,
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['name', 'email', 'role', 'createdAt'],
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'role',
      type: 'select',
      required: true,
      defaultValue: 'participant',
      options: [
        { label: 'Admin', value: 'admin' },
        { label: 'Program Manager', value: 'program_manager' },
        { label: 'Mentor', value: 'mentor' },
        { label: 'Participant', value: 'participant' },
      ],
    },
    {
      name: 'phone',
      type: 'text',
    },
    {
      name: 'moodleUserId',
      type: 'text',
      admin: {
        description: 'Moodle user ID after sync',
        readOnly: true,
      },
    },
    {
      name: 'avatar',
      type: 'upload',
      relationTo: 'media',
    },
  ],
  access: {
    read: ({ req }) => {
      if (req.user?.role === 'admin') return true
      return { id: { equals: req.user?.id } }
    },
    update: ({ req }) => {
      if (req.user?.role === 'admin') return true
      return { id: { equals: req.user?.id } }
    },
    delete: ({ req }) => req.user?.role === 'admin',
    create: () => true,
  },
}
