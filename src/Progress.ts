import ora, { Ora } from 'ora'

/**
 * CLI progress indicator.
 */
class Progress {
  private spinner: Ora

  /**
   * Creates a new instance of the class.
   * @class
   */
  constructor() {
    this.spinner = ora()
  }

  /**
   * Succeeds the current step.
   * @param msg - The persisted message for the current step. If not specified, it'll use the current message.
   */
  succeed(msg?: string) {
    this.spinner.succeed(msg)
  }

  /**
   * Updates the current step message.
   * @param msg - The new message.
   */
  update(msg: string) {
    this.spinner.text = msg
    this.spinner.start()
  }

  /**
   * Fails the current step and stop the process.
   * @param error - The encountered error.
   */
  fail(error: Error) {
    this.spinner.fail()

    console.error(error.message)

    process.exit(1)
  }
}

export default new Progress()
