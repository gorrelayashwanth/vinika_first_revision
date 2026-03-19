import { store } from "@/lib/store";

const AnnouncementBar = () => {
  const settings = store.getSettings();

  return (
    <div className="bg-primary overflow-hidden">
      <div className="py-2">
        <div className="animate-ticker whitespace-nowrap">
          <span className="text-gold text-sm font-medium">
            {settings.announcementBar} &nbsp;&nbsp;•&nbsp;&nbsp; {settings.announcementBar} &nbsp;&nbsp;•&nbsp;&nbsp; {settings.announcementBar}
          </span>
        </div>
      </div>
    </div>
  );
};

export default AnnouncementBar;
