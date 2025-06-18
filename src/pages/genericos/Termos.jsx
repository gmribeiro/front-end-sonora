import useTitle from '../../hooks/useTitle.js';

function Termos() {
  useTitle('Termos de Uso Sonora');

  return (
    <div
      className="w-full min-h-screen bg-cover bg-center p-4 sm:p-6 md:p-8 flex flex-col items-center justify-center relative overflow-hidden"
      style={{ backgroundImage: "url('../../../images/fundotermos.png')" }}
    >
      <div
        className="
          bg-[#564A72] rounded-md p-4 sm:p-6 
          w-full max-w-[600px] sm:max-w-[800px] md:max-w-[900px] lg:max-w-[1000px]
          h-[65vh] sm:h-[70vh] md:h-[75vh] lg:h-[85vh] max-h-[calc(100vh-96px)] 
          flex justify-center items-center overflow-hidden
        "
      >
        <iframe
          src="../pdfs/termos.pdf"
          title="Termos de Uso"
          className="w-full h-full border-none"
          loading="lazy"
        />
      </div>

      <button
        aria-label="Voltar para a página inicial"
        className="absolute bottom-4 right-4 !bg-[#564A72] text-[#EDE6F2] px-6 py-3 sm:px-6 sm:py-3 hover:!bg-[#c2a0bb] focus:outline-none focus:ring-2 focus:ring-[#ab8feb] transition-all duration-200"
        onClick={() => window.location.href = '/'}
      >
        Voltar
      </button>
    </div>
  );
}

export default Termos;
