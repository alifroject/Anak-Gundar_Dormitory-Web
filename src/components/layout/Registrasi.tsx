import { useRouter } from 'next/router';
import { useState, ChangeEvent, FormEvent } from 'react';


interface FormData {
  email: string;
  password: string;
  phone: string;
}

const RegisterPage: React.FC = () => {
  const router = useRouter();
  const { source } = router.query; // Ambil parameter 'source' dari URL

  // State untuk menyimpan data form
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    phone: '',
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Logika untuk menyimpan data pendaftaran ke Firebase
    console.log('Data Registrasi:', formData);

    // Arahkan pengguna ke halaman yang sesuai setelah pendaftaran
    if (source === 'detail%20kos') {
      // Jika datang dari detail kos
      router.push('/success-detail'); // Arahkan ke halaman sukses pendaftaran dari detail kos
    } else {
      // Jika datang dari homepage
      router.push('/success-home'); // Arahkan ke halaman sukses pendaftaran dari homepage
    }
  };

  return (
    <>
      

      <div className="h-full min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
          <h1 className="text-2xl font-semibold text-center mb-6">Registrasi</h1>
          {source && <p className="text-sm text-gray-500 mb-4">Sumber pendaftaran: {source}</p>} {/* Menampilkan sumber */}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-700 font-medium mb-2">Email:</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-2">Password:</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-2">Nomor Telepon:</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition duration-200"
            >
              Daftar
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default RegisterPage;
