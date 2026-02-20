import PocketBase, { BaseAuthStore } from 'pocketbase'

// In-memory auth store — session is NOT persisted to localStorage
class MemoryAuthStore extends BaseAuthStore {
  constructor() {
    super()
    this._token = ''
    this._model = null
  }

  get token() { return this._token }
  get model() { return this._model }

  save(token, model) {
    this._token = token
    this._model = model
    this.triggerChange()
  }

  clear() {
    this._token = ''
    this._model = null
    this.triggerChange()
  }
}

const pb = new PocketBase(
  import.meta.env.VITE_POCKETBASE_URL || 'http://127.0.0.1:8090',
  new MemoryAuthStore()
)

// Disable auto cancellation for duplicate requests
pb.autoCancellation(false)

export default pb
