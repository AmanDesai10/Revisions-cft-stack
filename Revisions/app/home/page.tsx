
export default function HomePage() {
  return (
    <section className="w-full h-screen py-12 md:py-24 lg:py-32 xl:py-48 bg-black">
      <div className="container px-4 md:px-6">
        <div className="grid gap-6 items-center">
          <div className="flex flex-col justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-500">
                Revolutionize Your Changelogs with Revisions
              </h1>
              <p className="max-w-[600px] text-zinc-200 md:text-xl dark:text-zinc-100 mx-auto">
                Join us and take control of your packages changelogs. Revisions is a new way to manage your changelogs and keep your users informed. You also get a sub domain to host your changelogs.
              </p>
            </div>
            <div className="w-full max-w-sm space-y-2 mx-auto">
              <button className="bg-white text-black p-2.5 rounded-md">
                Get Started
              </button>
              <p className="text-md text-zinc-200 dark:text-zinc-100 text-center">
                CSCI 5409 - Cloud Computing</p>
              <p className="text-md text-zinc-200 dark:text-zinc-100 text-center">
                Aman Desai - B00965752
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

