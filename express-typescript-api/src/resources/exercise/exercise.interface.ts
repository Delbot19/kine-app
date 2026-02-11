export interface CreateExerciseInput {
    title: string
    description: string
    duration: string
    category: string
    tip?: string
    difficulty: 'Facile' | 'Modéré' | 'Difficile'
    icon?: 'target' | 'refresh' | 'zap' | 'circle' | 'dumbbell' | 'activity'
    isGlobal?: boolean
}

export interface ToggleExerciseLogInput {
    exerciseId: string
    completed: boolean
    date?: string // Optional date override, default to today
}
