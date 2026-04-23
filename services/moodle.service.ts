/**
 * Moodle Service — All communication with Moodle LMS via REST API.
 * Every function is safe to retry (idempotent).
 */

const MOODLE_BASE = process.env.MOODLE_BASE_URL!
const MOODLE_TOKEN = process.env.MOODLE_API_TOKEN!

async function moodleCall<T>(wsfunction: string, params: Record<string, unknown>): Promise<T> {
  const url = new URL(`${MOODLE_BASE}/webservice/rest/server.php`)
  url.searchParams.set('wstoken', MOODLE_TOKEN)
  url.searchParams.set('wsfunction', wsfunction)
  url.searchParams.set('moodlewsrestformat', 'json')

  const body = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (Array.isArray(value)) {
      value.forEach((v, i) => {
        if (typeof v === 'object') {
          Object.entries(v as Record<string, unknown>).forEach(([k, val]) => {
            body.append(`${key}[${i}][${k}]`, String(val))
          })
        } else {
          body.append(`${key}[${i}]`, String(v))
        }
      })
    } else {
      body.append(key, String(value))
    }
  }

  const res = await fetch(url.toString(), {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  })

  if (!res.ok) {
    throw new Error(`Moodle API error: ${res.status} ${res.statusText}`)
  }

  const data = await res.json()

  if (data?.exception) {
    throw new Error(`Moodle exception: ${data.message}`)
  }

  return data as T
}

// ─── Create Moodle user ────────────────────────────────────
export async function createMoodleUser({
  username,
  password,
  firstname,
  lastname,
  email,
}: {
  username: string
  password: string
  firstname: string
  lastname: string
  email: string
}): Promise<{ id: number; username: string }> {
  const result = await moodleCall<[{ id: number; username: string }]>(
    'core_user_create_users',
    {
      users: [{ username, password, firstname, lastname, email, auth: 'manual' }],
    }
  )
  return result[0]
}

// ─── Get Moodle user by email ──────────────────────────────
export async function getMoodleUserByEmail(email: string): Promise<{ id: number } | null> {
  try {
    const result = await moodleCall<{ users: { id: number }[] }>(
      'core_user_get_users',
      { criteria: [{ key: 'email', value: email }] }
    )
    return result.users?.[0] ?? null
  } catch {
    return null
  }
}

// ─── Enroll user in course ─────────────────────────────────
export async function enrollUserInCourse({
  moodleUserId,
  moodleCourseId,
  roleId = 5, // student role
}: {
  moodleUserId: number
  moodleCourseId: string
  roleId?: number
}): Promise<void> {
  await moodleCall('enrol_manual_enrol_users', {
    enrolments: [{ roleid: roleId, userid: moodleUserId, courseid: Number(moodleCourseId) }],
  })
}

// ─── Unenroll user from course (for refunds) ──────────────
export async function unenrollUserFromCourse({
  moodleUserId,
  moodleCourseId,
}: {
  moodleUserId: number
  moodleCourseId: string
}): Promise<void> {
  await moodleCall('enrol_manual_unenrol_users', {
    enrolments: [{ userid: moodleUserId, courseid: Number(moodleCourseId) }],
  })
}

// ─── Get course completion status ─────────────────────────
export async function getCourseCompletion({
  moodleUserId,
  moodleCourseId,
}: {
  moodleUserId: number
  moodleCourseId: string
}): Promise<{ completed: boolean; timecompleted?: number }> {
  try {
    const result = await moodleCall<{ completionstatus: { completed: boolean; timecompleted: number } }>(
      'core_completion_get_course_completion_status',
      { courseid: Number(moodleCourseId), userid: moodleUserId }
    )
    return {
      completed: result.completionstatus?.completed ?? false,
      timecompleted: result.completionstatus?.timecompleted,
    }
  } catch {
    return { completed: false }
  }
}

// ─── Full sync: ensure user exists, then enroll ───────────
export async function syncUserEnrollment({
  userId,
  userEmail,
  userName,
  moodleCourseId,
}: {
  userId: string
  userEmail: string
  userName: string
  moodleCourseId: string
}): Promise<number> {
  // Get or create Moodle user
  let moodleUser = await getMoodleUserByEmail(userEmail)

  if (!moodleUser) {
    const [firstname, ...rest] = userName.split(' ')
    moodleUser = await createMoodleUser({
      username: userEmail.split('@')[0] + '_' + userId.slice(0, 6),
      password: `Nstc@${Math.random().toString(36).slice(2, 10)}`,
      firstname,
      lastname: rest.join(' ') || 'User',
      email: userEmail,
    })
  }

  // Enroll in course
  await enrollUserInCourse({ moodleUserId: moodleUser.id, moodleCourseId })

  return moodleUser.id
}
