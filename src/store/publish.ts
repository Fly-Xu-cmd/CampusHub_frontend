import { defineStore } from 'pinia'

interface PublishState {
	endTime: number
}

export const usePublishStore = defineStore('publish', {
	state: (): PublishState => ({
		endTime: Date.now()
	}),

	actions: {
		setEndTime(time: number) {
			this.endTime = time
		}
	}
})
