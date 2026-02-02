"use client";

const listItems = [
  {
    id: 1,
    image: "/home-page/patient.png",
    title: "Patient Management",
    description:
      "Centralize patient records and demographics in one secure location.",
  },
  {
    id: 2,
    image: "/home-page/appointment.png",
    title: "Smart Scheduling",
    description:
      "Easy appointment bookings with seamless UI to utilize time properly.",
  },
  {
    id: 3,
    image: "/home-page/invoice.png",
    title: "Invoice Management",
    description:
      "Track, and manage invoices effortlessly with automated billing workflows.",
  },
  {
    id: 4,
    image: "/home-page/users.png",
    title: "Users Dashboard",
    description: "View, manage and search all users at a single place.",
  },
];

export default function CarouselSection() {
  return (
    <section className="py-20 bg-background border-b border-border">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-foreground mb-4 text-balance">
            See CliniSync in Action
          </h2>
          <p className="text-lg text-muted-foreground">
            Explore key features that transform healthcare management
          </p>
        </div>

        <div className="space-y-16">
          {listItems.map((item, index) => (
            <div
              key={item.id}
              className={`flex flex-col ${
                index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
              } gap-8 items-center`}
            >
              <div className="flex-1 min-w-0">
                <div className="rounded-lg overflow-hidden border">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="h-full w-auto"
                  />
                </div>
              </div>

              <div className="flex-1">
                <h3 className="text-3xl font-bold text-foreground mb-3">
                  {item.title}
                </h3>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
