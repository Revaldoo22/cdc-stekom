import type { Job, Category, Location, TipeKerja } from '@/types'

export const mockCategories: Category[] = [
  { slug: 'teknologi', name: 'Teknologi', count: 18 },
  { slug: 'marketing', name: 'Marketing', count: 12 },
  { slug: 'desain', name: 'Desain', count: 8 },
  { slug: 'keuangan', name: 'Keuangan', count: 7 },
  { slug: 'pendidikan', name: 'Pendidikan', count: 5 },
  { slug: 'logistik', name: 'Logistik', count: 6 },
]

export const mockLocations: Location[] = [
  { slug: 'semarang', name: 'Semarang', count: 22 },
  { slug: 'jakarta', name: 'Jakarta', count: 15 },
  { slug: 'surabaya', name: 'Surabaya', count: 10 },
  { slug: 'yogyakarta', name: 'Yogyakarta', count: 9 },
  { slug: 'bandung', name: 'Bandung', count: 7 },
]

export const mockTipeKerja: TipeKerja[] = [
  { slug: 'full-time', name: 'Full Time', count: 30 },
  { slug: 'part-time', name: 'Part Time', count: 14 },
  { slug: 'magang', name: 'Magang', count: 10 },
  { slug: 'freelance', name: 'Freelance', count: 6 },
  { slug: 'kontrak', name: 'Kontrak', count: 8 },
]

export const mockJobs: Job[] = [
  {
    id: '1',
    slug: 'frontend-developer-tokopedia-semarang',
    title: 'Frontend Developer',
    company: 'PT Tokopedia Semarang',
    location: 'Semarang',
    locationSlug: 'semarang',
    category: 'Teknologi',
    categorySlug: 'teknologi',
    employmentType: 'Full Time',
    employmentTypeSlug: 'full-time',
    salary: 'Rp 6.000.000 – 9.000.000',
    description: `<p>Kami mencari Frontend Developer berpengalaman untuk bergabung dengan tim engineering kami di Semarang.</p>
<p>Anda akan bertanggung jawab membangun antarmuka pengguna yang responsif dan performatif menggunakan teknologi web modern.</p>
<h3>Tanggung Jawab</h3>
<ul>
<li>Membangun dan memelihara komponen UI menggunakan React dan TypeScript</li>
<li>Berkolaborasi dengan tim desain untuk mengimplementasikan desain yang pixel-perfect</li>
<li>Mengoptimalkan performa aplikasi web</li>
<li>Menulis unit test dan integration test</li>
</ul>`,
    requirements: [
      'Pengalaman minimal 2 tahun sebagai Frontend Developer',
      'Menguasai React.js dan TypeScript',
      'Familiar dengan Tailwind CSS atau CSS-in-JS',
      'Pemahaman tentang Web Performance dan SEO',
      'Kemampuan komunikasi yang baik dalam tim',
    ],
    skills: ['React', 'TypeScript', 'Tailwind CSS', 'Next.js', 'Git'],
    postedAt: '2026-06-10T09:00:00Z',
    expiresAt: '2026-07-10T23:59:00Z',
  },
  {
    id: '2',
    slug: 'digital-marketing-specialist-semarang',
    title: 'Digital Marketing Specialist',
    company: 'CV Digital Nusantara',
    location: 'Semarang',
    locationSlug: 'semarang',
    category: 'Marketing',
    categorySlug: 'marketing',
    employmentType: 'Full Time',
    employmentTypeSlug: 'full-time',
    salary: 'Rp 4.500.000 – 6.500.000',
    description: `<p>Bergabunglah dengan tim marketing kami sebagai Digital Marketing Specialist dan bantu kami mengembangkan brand awareness secara online.</p>
<h3>Tanggung Jawab</h3>
<ul>
<li>Mengelola kampanye iklan di Google Ads dan Meta Ads</li>
<li>Membuat dan mengoptimalkan konten media sosial</li>
<li>Menganalisis performa kampanye dan membuat laporan</li>
<li>Berkoordinasi dengan tim kreatif untuk materi iklan</li>
</ul>`,
    requirements: [
      'Pengalaman minimal 1 tahun di bidang digital marketing',
      'Menguasai Google Ads dan Meta Ads',
      'Familiar dengan Google Analytics dan tools SEO',
      'Kemampuan analisis data yang baik',
    ],
    skills: ['Google Ads', 'Meta Ads', 'SEO', 'Google Analytics', 'Content Marketing'],
    applyUrl: 'https://example.com/apply/2',
    postedAt: '2026-06-12T08:00:00Z',
    expiresAt: '2026-07-12T23:59:00Z',
  },
  {
    id: '3',
    slug: 'ui-ux-designer-jakarta',
    title: 'UI/UX Designer',
    company: 'PT Kreasi Digital Indonesia',
    location: 'Jakarta',
    locationSlug: 'jakarta',
    category: 'Desain',
    categorySlug: 'desain',
    employmentType: 'Full Time',
    employmentTypeSlug: 'full-time',
    salary: 'Rp 7.000.000 – 10.000.000',
    description: `<p>Kami membutuhkan UI/UX Designer yang kreatif dan berpengalaman untuk merancang pengalaman pengguna yang luar biasa.</p>
<h3>Tanggung Jawab</h3>
<ul>
<li>Merancang wireframe, prototype, dan mockup</li>
<li>Melakukan user research dan usability testing</li>
<li>Membuat design system yang konsisten</li>
<li>Berkolaborasi erat dengan tim engineering</li>
</ul>`,
    requirements: [
      'Pengalaman minimal 2 tahun sebagai UI/UX Designer',
      'Menguasai Figma',
      'Portfolio yang kuat dengan contoh aplikasi mobile dan web',
      'Pemahaman tentang design thinking dan user-centered design',
    ],
    skills: ['Figma', 'Prototyping', 'User Research', 'Design Systems', 'Wireframing'],
    postedAt: '2026-06-08T10:00:00Z',
    expiresAt: '2026-07-08T23:59:00Z',
  },
  {
    id: '4',
    slug: 'backend-developer-nodejs-surabaya',
    title: 'Backend Developer (Node.js)',
    company: 'PT Solusi Teknologi Jawa',
    location: 'Surabaya',
    locationSlug: 'surabaya',
    category: 'Teknologi',
    categorySlug: 'teknologi',
    employmentType: 'Full Time',
    employmentTypeSlug: 'full-time',
    salary: 'Rp 7.500.000 – 11.000.000',
    description: `<p>Kami mencari Backend Developer dengan keahlian Node.js untuk membangun API yang skalabel dan andal.</p>
<h3>Tanggung Jawab</h3>
<ul>
<li>Mengembangkan dan memelihara REST API</li>
<li>Merancang arsitektur database yang efisien</li>
<li>Implementasi keamanan dan autentikasi</li>
<li>Code review dan mentoring junior developer</li>
</ul>`,
    requirements: [
      'Pengalaman minimal 3 tahun dengan Node.js',
      'Menguasai Express.js atau Fastify',
      'Berpengalaman dengan PostgreSQL dan Redis',
      'Familiar dengan Docker dan CI/CD',
    ],
    skills: ['Node.js', 'Express.js', 'PostgreSQL', 'Redis', 'Docker'],
    postedAt: '2026-06-11T07:00:00Z',
    expiresAt: '2026-07-11T23:59:00Z',
  },
  {
    id: '5',
    slug: 'staf-keuangan-magang-semarang',
    title: 'Staf Keuangan (Magang)',
    company: 'PT Maju Bersama Group',
    location: 'Semarang',
    locationSlug: 'semarang',
    category: 'Keuangan',
    categorySlug: 'keuangan',
    employmentType: 'Magang',
    employmentTypeSlug: 'magang',
    salary: 'Rp 1.200.000 – 1.500.000',
    description: `<p>Kesempatan magang bagi mahasiswa/i jurusan Akuntansi atau Keuangan untuk mendapatkan pengalaman kerja nyata.</p>
<h3>Tanggung Jawab</h3>
<ul>
<li>Membantu pencatatan transaksi keuangan harian</li>
<li>Menyiapkan laporan keuangan bulanan</li>
<li>Rekonsiliasi data keuangan</li>
<li>Administrasi dokumen keuangan</li>
</ul>`,
    requirements: [
      'Mahasiswa aktif jurusan Akuntansi, Keuangan, atau sejenisnya',
      'Menguasai Microsoft Excel',
      'Teliti dan bertanggung jawab',
      'Bersedia magang minimal 3 bulan',
    ],
    skills: ['Microsoft Excel', 'Akuntansi', 'Laporan Keuangan'],
    postedAt: '2026-06-13T08:00:00Z',
    expiresAt: '2026-07-01T23:59:00Z',
  },
  {
    id: '6',
    slug: 'content-creator-part-time-yogyakarta',
    title: 'Content Creator (Part Time)',
    company: 'Studio Kreatif Nusantara',
    location: 'Yogyakarta',
    locationSlug: 'yogyakarta',
    category: 'Marketing',
    categorySlug: 'marketing',
    employmentType: 'Part Time',
    employmentTypeSlug: 'part-time',
    salary: 'Rp 2.000.000 – 3.500.000',
    description: `<p>Kami mencari Content Creator berbakat yang mampu menciptakan konten menarik untuk berbagai platform media sosial.</p>
<h3>Tanggung Jawab</h3>
<ul>
<li>Membuat konten foto dan video untuk Instagram, TikTok, YouTube</li>
<li>Menulis caption yang engaging dan relevan</li>
<li>Mengikuti tren konten terkini</li>
<li>Berkolaborasi dengan tim marketing untuk kampanye</li>
</ul>`,
    requirements: [
      'Kreatif dan memiliki estetika visual yang baik',
      'Menguasai editing foto dan video (Capcut, Adobe Premiere, dll)',
      'Aktif di media sosial',
      'Bersedia bekerja fleksibel',
    ],
    skills: ['Video Editing', 'Photography', 'Copywriting', 'Instagram', 'TikTok'],
    applyUrl: 'https://example.com/apply/6',
    postedAt: '2026-06-09T11:00:00Z',
    expiresAt: '2026-07-09T23:59:00Z',
  },
  {
    id: '7',
    slug: 'data-analyst-bandung',
    title: 'Data Analyst',
    company: 'PT Analytics Indonesia',
    location: 'Bandung',
    locationSlug: 'bandung',
    category: 'Teknologi',
    categorySlug: 'teknologi',
    employmentType: 'Full Time',
    employmentTypeSlug: 'full-time',
    salary: 'Rp 8.000.000 – 12.000.000',
    description: `<p>Posisi Data Analyst untuk membantu bisnis mengambil keputusan berbasis data.</p>
<h3>Tanggung Jawab</h3>
<ul>
<li>Menganalisis data bisnis untuk insight strategis</li>
<li>Membuat dashboard dan visualisasi data</li>
<li>Berkolaborasi dengan stakeholder untuk memahami kebutuhan data</li>
</ul>`,
    requirements: [
      'Pengalaman minimal 2 tahun sebagai Data Analyst',
      'Menguasai SQL dan Python',
      'Berpengalaman dengan Tableau atau Power BI',
      'Kemampuan statistik yang kuat',
    ],
    skills: ['SQL', 'Python', 'Tableau', 'Power BI', 'Statistics'],
    postedAt: '2026-06-14T09:00:00Z',
    expiresAt: '2026-07-14T23:59:00Z',
  },
  {
    id: '8',
    slug: 'guru-matematika-sma-semarang',
    title: 'Guru Matematika SMA',
    company: 'SMA Unggulan Semarang',
    location: 'Semarang',
    locationSlug: 'semarang',
    category: 'Pendidikan',
    categorySlug: 'pendidikan',
    employmentType: 'Full Time',
    employmentTypeSlug: 'full-time',
    salary: 'Rp 3.500.000 – 5.000.000',
    description: `<p>Kami membutuhkan Guru Matematika yang berdedikasi untuk mendidik siswa SMA.</p>
<h3>Tanggung Jawab</h3>
<ul>
<li>Mengajar mata pelajaran Matematika kelas X, XI, XII</li>
<li>Menyiapkan materi ajar dan soal evaluasi</li>
<li>Membimbing siswa dalam persiapan ujian</li>
</ul>`,
    requirements: [
      'Sarjana Pendidikan Matematika atau Matematika',
      'Memiliki sertifikat pendidik (diutamakan)',
      'Sabar dan mampu menjelaskan dengan baik',
    ],
    skills: ['Matematika', 'Pengajaran', 'Kurikulum Merdeka'],
    postedAt: '2026-06-07T08:00:00Z',
    expiresAt: '2026-07-07T23:59:00Z',
  },
]
