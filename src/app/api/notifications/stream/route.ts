import { NextResponse } from 'next/server';

export async function GET() {
  const encoder = new TextEncoder();
  
  const stream = new ReadableStream({
    start(controller) {
      const sendPing = () => {
        const data = JSON.stringify({ type: 'ping' });
        controller.enqueue(encoder.encode(`data: ${data}\n\n`));
      };

      sendPing();
      const interval = setInterval(sendPing, 30000);

      const sendNotification = () => {
        const notifications = [
          { type: 'success', title: 'Task Completed', message: 'Task #123 has been completed' },
          { type: 'info', title: 'Plan Generated', message: 'AI plan has been generated successfully' },
          { type: 'warning', title: 'Deployment Pending', message: 'Deployment is waiting for approval' },
        ];
        
        const notification = notifications[Math.floor(Math.random() * notifications.length)];
        const data = JSON.stringify({
          id: crypto.randomUUID(),
          ...notification,
          timestamp: new Date().toISOString(),
        });
        controller.enqueue(encoder.encode(`data: ${data}\n\n`));
      };

      const notificationInterval = setInterval(sendNotification, 10000);

      const cleanup = () => {
        clearInterval(interval);
        clearInterval(notificationInterval);
        controller.close();
      };

      setTimeout(cleanup, 300000);
    },
  });

  return new NextResponse(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
