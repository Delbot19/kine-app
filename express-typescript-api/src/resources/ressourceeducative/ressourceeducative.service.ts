import RessourceEducative from '../../models/ressourceeducative.model'
import type {
    CreateRessourceEducativeInput,
    UpdateRessourceEducativeInput,
} from './ressourceeducative.interface'

interface RessourceEducativeServiceResult {
    success: boolean
    ressource?: any
    ressources?: any[]
    message?: string
}

export default class RessourceEducativeService {
    async createRessourceEducative(
        input: CreateRessourceEducativeInput,
    ): Promise<RessourceEducativeServiceResult> {
        const ressource = await RessourceEducative.create(input)
        return { success: true, ressource }
    }

    async updateRessourceEducative(
        id: string,
        input: UpdateRessourceEducativeInput,
    ): Promise<RessourceEducativeServiceResult> {
        const ressource = await RessourceEducative.findByIdAndUpdate(id, input, { new: true })
        if (!ressource) return { success: false, message: 'Ressource non trouvée.' }
        return { success: true, ressource }
    }

    async deleteRessourceEducative(id: string): Promise<RessourceEducativeServiceResult> {
        const ressource = await RessourceEducative.findByIdAndDelete(id)
        if (!ressource) return { success: false, message: 'Ressource non trouvée.' }
        return { success: true, message: 'Ressource supprimée.' }
    }

    async getRessourceEducativeById(id: string): Promise<RessourceEducativeServiceResult> {
        const ressource = await RessourceEducative.findById(id)
        if (!ressource) return { success: false, message: 'Ressource non trouvée.' }
        return { success: true, ressource }
    }

    async getAllRessourcesEducatives(): Promise<RessourceEducativeServiceResult> {
        const ressources = await RessourceEducative.find({ visibilite: 'public' })
        return { success: true, ressources }
    }

    async searchRessources(query: string): Promise<RessourceEducativeServiceResult> {
        const ressources = await RessourceEducative.find({
            visibilite: 'public',
            $or: [
                { titre: { $regex: query, $options: 'i' } },
                { contenu: { $regex: query, $options: 'i' } },
                { tags: { $regex: query, $options: 'i' } },
            ],
        })
        return { success: true, ressources }
    }
}
