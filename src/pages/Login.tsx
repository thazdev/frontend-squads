import berryLogo from "../assets/berryLogoBranco.png";
import LoginForm from "../components/LoginForm";

export default function Login() {
  return (
    <div className="relative min-h-screen bg-[#0a1430]">
      <img
        src="/src/assets/berryBackground.svg"
        alt="background"
        className="absolute inset-0 w-full h-full object-cover z-0"
      />
      <div className="relative z-20 flex flex-col lg:flex-row items-center justify-between px-6 lg:px-24 py-16 min-h-screen">
        <div className="text-white max-w-xl mb-16 lg:mb-0">
          <img src={berryLogo} alt="Berry Logo" className="w-40 mb-6" />
          <h1 className="text-4xl font-bold mb-2">Bem-vindo de volta</h1>
          <p className="text-lg text-gray-200">
            Acesse sua conta para continuar
          </p>
        </div>
        <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-2xl">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
