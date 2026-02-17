import 'dotenv/config'
import fs from 'fs'
import { Sandbox } from '@e2b/desktop'

async function main() {
  const apiKey = process.env.E2B_API
  if (!apiKey) {
    console.error('E2B_API environment variable is not set. Set it and re-run.')
    process.exit(1)
  }

  let desktop
  try {
    desktop = await Sandbox.create()
    console.log('Sandbox created:', desktop.sandboxId)

    // Launch Chrome and wait 10s
    await desktop.launch('google-chrome')
    console.log('Launched google-chrome, waiting 10s')
    await desktop.wait(10000)

    // Start stream for active window with auth
    await desktop.stream.start({
      windowId: await desktop.getCurrentWindowId(),
      requireAuth: true,
    })
    const authKey = desktop.stream.getAuthKey()
    console.log('Stream URL:', desktop.stream.getUrl({ authKey }))

    // Take a screenshot (bytes) and save
    const shot = await desktop.screenshot('bytes')
    fs.writeFileSync('screenshot.png', Buffer.from(shot))
    console.log('Saved screenshot.png')

    // Write and press Enter
    await desktop.write('What is the capital of Germany?')
    await desktop.press('enter')

    // Mouse example: move and left click
    await desktop.moveMouse(200, 200)
    await desktop.leftClick()

    // Run a bash command
    const lsOut = await desktop.commands.run('ls -la')
    console.log('ls output (first 200 chars):', lsOut.slice(0, 200))

    // Stop stream
    await desktop.stream.stop()
    console.log('Stream stopped')

    // Keep sandbox alive briefly then exit
    await desktop.wait(3000)
  } catch (err) {
    console.error('Error:', err)
  } finally {
    // Not auto-killing sandbox for safety
    console.log('Finished quick example (sandbox left running).')
  }
}

main()
