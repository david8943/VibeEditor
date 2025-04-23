export interface ICommand {
  commandName: string
  execute(...args: any[]): Promise<void> | void
}
