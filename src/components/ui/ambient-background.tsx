export function AmbientBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-amber-200/20 blur-[128px] animate-float" />
      <div className="absolute top-[30%] right-[-10%] w-[500px] h-[500px] rounded-full bg-amber-300/15 blur-[120px] animate-float-delayed" />
      <div className="absolute bottom-[-10%] left-[30%] w-[400px] h-[400px] rounded-full bg-orange-200/15 blur-[100px] animate-float" />
      <div className="absolute top-[60%] left-[-5%] w-[300px] h-[300px] rounded-full bg-yellow-200/10 blur-[80px] animate-float-delayed" />
    </div>
  );
}
