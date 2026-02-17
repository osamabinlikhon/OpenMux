import 'dotenv/config';
import { Sandbox } from '@e2b/desktop';
async function main() {
    const apiKey = process.env.E2B_API;
    if (!apiKey) {
        console.error('E2B_API environment variable is not set. Set it and re-run.');
        process.exit(1);
    }
    let desktop;
    try {
        console.log('Creating desktop sandbox...');
        desktop = await Sandbox.create();
        console.log('Desktop sandbox created', desktop.sandboxId);
        console.log('Launching Google Chrome');
        await desktop.launch('google-chrome');
        await desktop.wait(15000);
        console.log('Starting to stream Google Chrome');
        await desktop.stream.start({
            windowId: await desktop.getCurrentWindowId(),
            requireAuth: true,
        });
        const authKey = desktop.stream.getAuthKey();
        console.log('Stream URL:', desktop.stream.getUrl({ authKey }));
        console.log('Writing to Google Chrome');
        await desktop.write('What is the capital of Germany?');
        await desktop.press('Enter');
        console.log('Waiting 15s');
        await desktop.wait(15000);
        console.log('Stopping the stream');
        await desktop.stream.stop();
        console.log('Launching VS Code');
        await desktop.launch('code');
        await desktop.wait(15000);
        console.log('Starting to stream VS Code');
        await desktop.stream.start({
            windowId: await desktop.getCurrentWindowId(),
            requireAuth: true,
        });
        const authKey2 = desktop.stream.getAuthKey();
        console.log('Stream URL (VS Code):', desktop.stream.getUrl({ authKey: authKey2 }));
        console.log('Example finished — keeping sandbox alive briefly');
        await desktop.wait(5000);
    }
    catch (err) {
        console.error('Error in e2b example:', err);
    }
    finally {
        if (desktop) {
            try {
                console.log('Killing sandbox');
                // await desktop.kill() // commented out for safety; uncomment to auto-kill
            }
            catch (e) {
                // ignore
            }
        }
    }
}
main();
//# sourceMappingURL=e2b_desktop_example.js.map