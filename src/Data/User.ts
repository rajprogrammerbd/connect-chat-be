import IUser from '../types/IUser'

class User {
  public value: IUser | null
  public next: User | null
  public prev: User | null

  constructor(obj: IUser) {
    this.value = obj
    this.next = null
    this.prev = null
  }
}

export default User
