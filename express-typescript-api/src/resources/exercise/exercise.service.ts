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
            {
                completed,
                // We will merge other fields in next step or use object spread if I change signature now
            },
            { new: true, upsert: true },
        )
        return log
    }
}

export default ExerciseService
