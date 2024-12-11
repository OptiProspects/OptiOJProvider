interface AnnouncementProps {
  message: string;
}

export default function Announcement({ message }: AnnouncementProps) {
  return (
    <div className="my-4 p-4 bg-yellow-200 border-l-4 border-yellow-600">
      <p>{message}</p>
    </div>
  );
}
