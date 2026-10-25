'use server'

import { db } from '@/lib/db'
import { auth0 } from '@/lib/auth0'

export async function saveTaxQuestionnaire(answers: Record<string, any>) {
  try {
    const session = await auth0.getSession()
    if (!session?.user) {
      return { success: false, error: 'User not authenticated' }
    }

    const userId = session.user.sub

    // Ensure User record exists in Tiger Data
    await db.user.upsert({
      where: { id: userId },
      update: { email: session.user.email },
      create: { id: userId, email: session.user.email },
    })

    // Save Questionnaire answers
    const record = await db.questionnaireResponse.upsert({
      where: { userId },
      update: { answers, isComplete: true },
      create: { userId, answers, isComplete: true },
    })

    return { success: true, data: record }
  } catch (error: any) {
    console.error('Failed to save tax data:', error)
    return { success: false, error: error.message || 'Database error' }
  }
}

export async function getTaxQuestionnaire() {
  try {
    const session = await auth0.getSession()
    if (!session?.user) return null

    return await db.questionnaireResponse.findUnique({
      where: { userId: session.user.sub },
    })
  } catch (error) {
    console.error('Failed to fetch tax data:', error)
    return null
  }
}