import type { Metadata } from 'next'
import { LegalLayout } from '@/components/legal/LegalLayout'

export const metadata: Metadata = {
  title: 'Kullanım Şartları — Google Business Data',
}

export default function TermsPage() {
  return (
    <LegalLayout title="Kullanım Şartları" updatedAt="29 Haziran 2026">
      <section>
        <p>
          Bu Kullanım Şartları (&quot;Şartlar&quot;), <strong>[ŞİRKET/İŞLETME UNVANI]</strong> (&quot;biz&quot;,
          &quot;Şirket&quot;) tarafından işletilen Google Business Data platformunun
          (&quot;Hizmet&quot;) kullanımına ilişkin koşulları düzenler. Hizmete kayıt
          olarak veya Hizmeti kullanarak bu Şartları kabul etmiş olursunuz; kabul
          etmiyorsanız Hizmeti kullanmamalısınız.
        </p>
      </section>

      <section>
        <h2>1. Hizmetin Tanımı</h2>
        <p>
          Hizmet; kullanıcıların belirledikleri kriterlere göre (şehir, kategori,
          anahtar kelime) Google Places API üzerinden herkese açık işletme
          bilgilerini (ad, adres, telefon, web sitesi, puan, yorum sayısı vb.)
          listelemesine, bu verileri filtrelemesine, dışa aktarmasına ve
          isteğe bağlı olarak kişiselleştirilmiş WhatsApp/e-posta mesajları
          hazırlayıp kendi hesapları üzerinden göndermesine olanak tanıyan bir
          web tabanlı araçtır.
        </p>
        <p>
          Hizmet, üçüncü taraf işletmelere toplu mesaj göndermez; mesaj hazırlama
          ve gönderim kararı tamamen kullanıcıya aittir (bkz. madde 4).
        </p>
      </section>

      <section>
        <h2>2. Hesap Oluşturma ve Güvenlik</h2>
        <p>
          Hizmeti kullanmak için doğru ve güncel bilgilerle bir hesap
          oluşturmanız gerekir. Hesap bilgilerinizin (e-posta, şifre)
          gizliliğinden ve hesabınız üzerinden yapılan tüm işlemlerden siz
          sorumlusunuz. Hesabınızla ilgili yetkisiz bir kullanım fark ederseniz
          bize derhal bildirmelisiniz.
        </p>
      </section>

      <section>
        <h2>3. Planlar, Ücretlendirme ve İade</h2>
        <p>
          Hizmet, sınırlı kredili bir <strong>Ücretsiz Plan</strong> ve
          <strong> Premium</strong> üyelik olmak üzere iki şekilde sunulur:
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>
            <strong>Premium üyelik</strong>, satın alındığı tarihten itibaren
            <strong> 30 gün</strong> geçerli, tek seferlik bir pakettir; otomatik
            yenileme veya tekrarlayan tahsilat yapılmaz. Süre sonunda hizmetin
            devamı için tekrar ödeme yapmanız gerekir.
          </li>
          <li>
            <strong>Ek kredi paketleri</strong> plandan bağımsız, tek seferlik
            satın alınır ve süresi dolmaz.
          </li>
        </ul>
        <p>
          Ödemeler iyzico ödeme altyapısı üzerinden, kart bilgileriniz bize
          ulaşmadan, iyzico&apos;nun güvenli ödeme sayfası üzerinden alınır.
          Hizmet dijital bir ürün olduğundan ve satın alma anında ifa
          edildiğinden (krediler/erişim anında tanımlanır), 6502 sayılı Tüketicinin
          Korunması Hakkında Kanun ve ilgili mesafeli sözleşmeler yönetmeliği
          kapsamında, hizmetin kullanımına başlanmasıyla cayma hakkı sona erer.
          Teknik bir hata nedeniyle hizmetin sağlanamadığı durumlarda talebiniz
          üzerine inceleme yapılır ve uygun görülmesi halinde iade sağlanır.
        </p>
      </section>

      <section>
        <h2>4. Kullanıcı Yükümlülükleri ve Yasaklı Kullanım</h2>
        <p>
          Hizmet üzerinden elde ettiğiniz işletme iletişim bilgilerini
          kullanarak WhatsApp veya e-posta yoluyla iletişime geçmek
          istediğinizde, aşağıdaki konularda <strong>tek sorumlu sizsiniz</strong>:
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>
            6698 sayılı Kişisel Verilerin Korunması Kanunu (&quot;KVKK&quot;) ve ilgili
            ikincil düzenlemelere uygun hareket etmek,
          </li>
          <li>
            6563 sayılı Elektronik Ticaretin Düzenlenmesi Hakkında Kanun
            kapsamında ticari elektronik ileti göndermeden önce gerekli izni
            almak ve İleti Yönetim Sistemi (İYS) yükümlülüklerine uymak,
          </li>
          <li>
            toplu, izinsiz veya yanıltıcı (spam) mesaj göndermemek,
          </li>
          <li>
            Google'ın kendi kullanım koşullarını ihlal edecek şekilde Hizmeti
            kullanmamak.
          </li>
        </ul>
        <p>
          Şirket, kullanıcıların gönderdiği mesajların içeriği veya gönderim
          şekli üzerinde kontrol sahibi değildir ve bu nedenle doğabilecek
          hukuki sorumluluk kullanıcıya aittir. Bu yükümlülüklerin ihlali
          tespit edildiğinde hesabınız askıya alınabilir veya kapatılabilir.
        </p>
      </section>

      <section>
        <h2>5. Veri Doğruluğu ve Üçüncü Taraf Hizmetler</h2>
        <p>
          Hizmet üzerinden sunulan işletme verileri Google Places API
          aracılığıyla elde edilir; bu verilerin güncelliği, doğruluğu veya
          eksiksizliği konusunda garanti verilmez. Hizmet, Google, iyzico ve
          kullanıcının bağladığı e-posta sağlayıcısı gibi üçüncü taraf
          servislere bağımlıdır; bu servislerin kesintisi veya değişikliği
          Hizmetin işleyişini etkileyebilir.
        </p>
      </section>

      <section>
        <h2>6. Fikri Mülkiyet</h2>
        <p>
          Hizmetin yazılımı, tasarımı ve marka unsurları Şirkete aittir.
          Kullanıcılar, kendi hesaplarıyla topladıkları işletme verileri
          üzerinde yalnızca kendi meşru ticari amaçları için kullanım hakkına
          sahiptir; bu verilerin üçüncü taraflara satılması veya toplu olarak
          paylaşılması yasaktır.
        </p>
      </section>

      <section>
        <h2>7. Sorumluluğun Sınırlandırılması</h2>
        <p>
          Hizmet &quot;olduğu gibi&quot; sunulur. Şirket, Hizmetin kesintisiz veya
          hatasız çalışacağını garanti etmez. Şirket, Hizmetin kullanımından
          kaynaklanan dolaylı zararlardan (kar kaybı, veri kaybı, üçüncü taraf
          talepleri dahil) yürürlükteki mevzuatın izin verdiği ölçüde sorumlu
          tutulamaz.
        </p>
      </section>

      <section>
        <h2>8. Hesabın Askıya Alınması veya Feshi</h2>
        <p>
          Bu Şartların ihlali, kötüye kullanım şüphesi veya yasal bir
          zorunluluk halinde hesabınızı önceden bildirimde bulunmaksızın
          askıya alabilir veya kapatabiliriz. Hesabınızı istediğiniz zaman
          Ayarlar sayfasından silebilirsiniz.
        </p>
      </section>

      <section>
        <h2>9. Değişiklikler</h2>
        <p>
          Bu Şartları zaman zaman güncelleyebiliriz. Önemli değişiklikler
          Hizmet üzerinden veya e-posta ile bildirilir. Güncellenmiş Şartların
          yayınlanmasından sonra Hizmeti kullanmaya devam etmeniz, değişiklikleri
          kabul ettiğiniz anlamına gelir.
        </p>
      </section>

      <section>
        <h2>10. Uygulanacak Hukuk ve Yetkili Mahkeme</h2>
        <p>
          Bu Şartlar Türkiye Cumhuriyeti kanunlarına tabidir. Bu Şartlardan
          kaynaklanan uyuşmazlıklarda <strong>[İL]</strong> Mahkemeleri ve İcra
          Daireleri yetkilidir.
        </p>
      </section>

      <section>
        <h2>11. İletişim</h2>
        <p>
          Sorularınız için <strong>[DESTEK E-POSTASI]</strong> adresinden bizimle
          iletişime geçebilirsiniz.
        </p>
      </section>
    </LegalLayout>
  )
}
