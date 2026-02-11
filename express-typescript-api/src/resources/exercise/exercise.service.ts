import { startOfDay, endOfDay } from 'date-fns'
import Exercise, { type IExercise } from '../../models/exercise.model'
import ExerciseLog, { type IExerciseLog } from '../../models/exerciselog.model'
import PlanTraitement from '../../models/plantraitement.model'
import { type CreateExerciseInput } from './exercise.interface'

class ExerciseService {
    /**
     * Get all exercises (Catalog)
     */
    public async getAllExercises(): Promise<IExercise[]> {
        return await Exercise.find().sort({ createdAt: -1 })
    }

    /**
     * Create a new exercise (Admin/Kine)
     */
    public async createExercise(input: CreateExerciseInput): Promise<IExercise> {
        return await Exercise.create(input)
    }

    /**
     * Update an exercise
     */
    public async updateExercise(
        id: string,
        input: Partial<CreateExerciseInput>,
    ): Promise<IExercise | null> {
        return await Exercise.findByIdAndUpdate(id, input, { new: true })
    }

    /**
     * Delete an exercise
     */
    public async deleteExercise(id: string): Promise<IExercise | null> {
        return await Exercise.findByIdAndDelete(id)
    }

    /**
     * Get exercises for a patient today, with completion status
     */
    public async getPatientExercisesToday(patientId: string): Promise<any[]> {
        // 1. Find active treatment plan for this patient
        const activePlan = await PlanTraitement.findOne({
            patientId,
            statut: 'en cours',
        }).populate('exercises.exerciseId')

        if (!activePlan?.exercises || activePlan.exercises.length === 0) {
            return []
        }

        // 2. Get today's date range
        const todayStart = startOfDay(new Date())
        const todayEnd = endOfDay(new Date())

        // 3. Get existing logs for today
        const logs = await ExerciseLog.find({
            patientId,
            date: { $gte: todayStart, $lte: todayEnd },
        })

        // 4. Merge plan exercises with logs
        return activePlan.exercises
            .map((item: any) => {
                const exercise = item.exerciseId
                // If exercise was deleted or null, handle gracefully
                if (!exercise) return null

                // Calculate expiration date
                const assignedAt = new Date(item.assignedAt || activePlan.createdAt) // Fallback to plan creation if missing
                const durationDays = Number(item.duree || activePlan.duree || 7)

                // Add duration to assigned date
                const expirationDate = new Date(assignedAt)
                expirationDate.setDate(expirationDate.getDate() + durationDays)

                // Check if expired (today > expirationDate)
                // We compare against end of today to be inclusive? Or start of today?
                // User said "au bout du nombre de jours". Usually implies inclusive.
                // If assigned today (Day 1) for 3 days -> Day 1, 2, 3. Expire on Day 4.
                // So if today > expirationDate, it's expired.
                // Let's use startOfDay for comparison to safely ignore time components.
                const today = startOfDay(new Date())
                // expirationDate should be set to endOfDay of that last day maybe?
                // Simpler: assignedAt (timestamp) + days * 24h.
                // If today is AFTER that window.

                // Let's stick to safe day comparison
                // If today is strictly after the expiration date (calculated as assigned + duration).
                if (today > expirationDate) {
                    return null
                }

                const log = logs.find((l: any) => String(l.exerciseId) === String(exercise._id))

                return {
                    id: exercise._id,
                    title: exercise.title,
                    description: exercise.description,
                    duration: exercise.duration,
                    tip: exercise.tip,
                    difficulty: exercise.difficulty,
                    icon: exercise.icon,
                    completed: log ? log.completed : false,
                    instructions: item.instructions, // Personal instructions from Plan
                    assignedAt: item.assignedAt,
                    daysLeft: Math.ceil(
                        (expirationDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
                    ),
                }
            })
            .filter((e) => e !== null)
    }

    /**
     * Toggle exercise completion for today
     */
    public async toggleExerciseCompletion(
        patientId: string,
        exerciseId: string,
        completed: boolean,
        feedback?: {
            douleur?: number
            difficulte?: string
            ressenti?: string
            modifications?: string
        },
    ): Promise<IExerciseLog> {
        const todayStart = startOfDay(new Date())

        const updateData: any = { completed }
        if (feedback) {
            if (feedback.douleur !== undefined) updateData.douleur = feedback.douleur
            if (feedback.difficulte) updateData.difficulte = feedback.difficulte
            if (feedback.ressenti) updateData.ressenti = feedback.ressenti
            if (feedback.modifications) updateData.modifications = feedback.modifications
        }

        // Upsert log for today
        const log = await ExerciseLog.findOneAndUpdate(
            {
                patientId,
                exerciseId,
                date: todayStart,
            },
            updateData,
            { new: true, upsert: true },
        )
        return log
    }

    /**
     * Get exercise logs for a specific patient (Kiné view)
     */
    public async getExerciseLogsByPatient(patientId: string): Promise<any[]> {
        return await ExerciseLog.find({ patientId })
            .populate('exerciseId', 'title description icon')
            .sort({ date: -1 })
    }
}

export default ExerciseService
