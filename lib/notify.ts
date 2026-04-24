export async function sendNotification(
  title: string,
  message: string
): Promise<void> {
  const topic = process.env.NTFY_TOPIC;
  if (!topic) return;

  try {
    await fetch(`https://ntfy.sh/${topic}`, {
      method: "POST",
      headers: {
        Title: title,
        "Content-Type": "text/plain; charset=utf-8",
      },
      body: message,
    });
  } catch {
    // 알림 실패는 무시 - 핵심 기능에 영향 없음
  }
}
