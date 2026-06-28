import type { Metadata } from 'next'
import { LegalLayout } from '@/components/legal/LegalLayout'

export const metadata: Metadata = {
  title: 'Gizlilik Politikası ve KVKK Aydınlatma Metni — Google Business Data',
}

export default function PrivacyPage() {
  return (
    <LegalLayout title="Gizlilik Politikası ve KVKK Aydınlatma Metni" updatedAt="29 Haziran 2026">
      <section>
        <h2>1. Veri Sorumlusu</h2>
        <p>
          6698 sayılı Kişisel Verilerin Korunması Kanunu (&quot;KVKK&quot;) kapsamında
          veri sorumlusu sıfatıyla hareket eden taraf:
        </p>
        <p>
          <strong>[ŞİRKET/İŞLETME UNVANI]</strong><br />
          Adres: <strong>[ADRES]</strong><br />
          E-posta: <strong>support@vintotap.com</strong>
        </p>
      </section>

      <section>
        <h2>2. Hangi Kişisel Verileri İşliyoruz</h2>
        <p>Hizmeti kullanan <strong>hesap sahibi</strong> olarak sizden:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Kimlik ve iletişim verileri: ad-soyad, e-posta, profil fotoğrafı,</li>
          <li>Hesap verileri: şifre (şifrelenmiş/hash), oturum bilgileri,</li>
          <li>
            Ödeme/fatura verileri: ad-soyad, T.C. kimlik numarası, telefon,
            adres, şehir — bu bilgiler ödeme sağlayıcımız iyzico aracılığıyla
            işlenir; kart numarası gibi hassas ödeme bilgileri bize hiçbir
            zaman ulaşmaz,
          </li>
          <li>Kullanım verileri: IP adresi, tarayıcı bilgisi, işlem kayıtları,</li>
          <li>
            Sizin oluşturduğunuz içerik: mesaj şablonları, gönderim ayarları,
            SMTP bilgileriniz (şifre alanı şifrelenmiş olarak saklanır).
          </li>
        </ul>
        <p className="mt-3">
          Ayrıca Hizmet, sizin arama kriterlerinize göre Google Places API
          üzerinden <strong>üçüncü taraf işletmelere</strong> ait herkese açık
          bilgileri (işletme adı, kategori, adres, telefon, web sitesi, puan)
          getirir ve hesabınızda saklar. Bu veriler Google Maps&apos;te zaten
          kamuya açık işletme bilgileridir; bu verilerin elde edilmesi ve
          kullanımı konusunda <strong>veri sorumlusu sizsiniz</strong> (bkz. madde 7).
        </p>
      </section>

      <section>
        <h2>3. Kişisel Verilerin İşlenme Amaçları</h2>
        <ul className="list-disc pl-5 space-y-1">
          <li>Hesabınızı oluşturmak, kimliğinizi doğrulamak ve Hizmete erişiminizi sağlamak,</li>
          <li>Talep ettiğiniz arama/veri toplama işlemlerini gerçekleştirmek,</li>
          <li>Ödeme işlemlerinizi gerçekleştirmek ve faturalandırmak,</li>
          <li>Hizmetle ilgili bildirimler, destek ve güvenlik uyarıları göndermek,</li>
          <li>Yasal yükümlülüklerimizi yerine getirmek ve kötüye kullanımı önlemek.</li>
        </ul>
      </section>

      <section>
        <h2>4. Hukuki Sebep</h2>
        <p>
          Kişisel verileriniz, KVKK&apos;nın 5. maddesinde yer alan
          &quot;bir sözleşmenin kurulması veya ifasıyla doğrudan doğruya ilgili
          olma&quot;, &quot;veri sorumlusunun hukuki yükümlülüğünü yerine getirebilmesi
          için zorunlu olma&quot; ve &quot;ilgili kişinin temel hak ve özgürlüklerine
          zarar vermemek kaydıyla veri sorumlusunun meşru menfaati&quot; hukuki
          sebeplerine dayanılarak işlenmektedir.
        </p>
      </section>

      <section>
        <h2>5. Kişisel Verilerin Aktarılması</h2>
        <p>Verileriniz, yalnızca Hizmetin işleyişi için gerekli ölçüde şu taraflarla paylaşılır:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li><strong>Supabase</strong> — veritabanı ve kimlik doğrulama altyapı sağlayıcımız,</li>
          <li><strong>iyzico</strong> — ödeme işlemleriniz için ödeme hizmeti sağlayıcısı,</li>
          <li>
            <strong>Kendi SMTP sağlayıcınız</strong> — e-posta gönderimi tercih
            ettiğinizde sizin tanımladığınız sağlayıcı üzerinden,
          </li>
          <li>Yasal bir talep halinde yetkili kamu kurum ve kuruluşları.</li>
        </ul>
        <p>
          Kullandığımız alt yapı sağlayıcıların sunucuları Türkiye dışında
          (Avrupa Birliği/ABD) konumlanabilir; bu durumda KVKK&apos;nın yurt dışına
          veri aktarımına ilişkin hükümlerine uygun şekilde hareket edilir.
        </p>
      </section>

      <section>
        <h2>6. Saklama Süresi</h2>
        <p>
          Kişisel verileriniz, hesabınız aktif olduğu sürece ve ilgili
          mevzuatın öngördüğü zorunlu saklama süreleri (örn. fatura/ödeme
          kayıtları için Vergi Usul Kanunu uyarınca 5 yıl) boyunca saklanır.
          Hesabınızı sildiğinizde, yasal saklama yükümlülüğü bulunan veriler
          hariç, kişisel verileriniz silinir veya anonim hale getirilir.
        </p>
      </section>

      <section>
        <h2>7. Hizmet Üzerinden Topladığınız Üçüncü Taraf Verileri — Önemli Uyarı</h2>
        <p>
          Hizmet aracılığıyla Google Maps&apos;ten elde ettiğiniz işletme sahibi
          iletişim bilgilerini kullanarak WhatsApp veya e-posta yoluyla
          iletişime geçmeyi seçerseniz, bu kişisel verilerin
          işlenmesi bakımından <strong>KVKK kapsamında veri sorumlusu sizsiniz</strong>.
          Şirket, bu noktada teknik altyapı sağlayan bir veri işleyen
          konumundadır. Ticari elektronik ileti göndermeden önce ilgili
          kişilerden izin almanız ve İleti Yönetim Sistemi (İYS) kaydınızı
          kontrol etmeniz yasal bir zorunluluktur (bkz. Kullanım Şartları
          madde 4).
        </p>
      </section>

      <section>
        <h2>8. Çerezler</h2>
        <p>
          Hizmet, oturumunuzu açık tutmak için zorunlu kimlik doğrulama
          çerezleri kullanır. Pazarlama veya üçüncü taraf reklam çerezleri
          kullanılmamaktadır.
        </p>
      </section>

      <section>
        <h2>9. Veri Güvenliği</h2>
        <p>
          Şifreleriniz hash&apos;lenerek, SMTP şifreniz AES-256 ile şifrelenerek
          saklanır. Verilerinize erişim, rol bazlı yetkilendirme (Row Level
          Security) ile sınırlandırılmıştır; bir kullanıcı yalnızca kendi
          verilerine erişebilir.
        </p>
      </section>

      <section>
        <h2>10. KVKK Kapsamındaki Haklarınız</h2>
        <p>KVKK&apos;nın 11. maddesi uyarınca aşağıdaki haklara sahipsiniz:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Kişisel verilerinizin işlenip işlenmediğini öğrenme,</li>
          <li>İşlenmişse buna ilişkin bilgi talep etme,</li>
          <li>İşlenme amacına uygun kullanılıp kullanılmadığını öğrenme,</li>
          <li>Yurt içinde/dışında aktarıldığı üçüncü kişileri bilme,</li>
          <li>Eksik veya yanlış işlenmişse düzeltilmesini isteme,</li>
          <li>KVKK&apos;nın 7. maddesindeki şartlar çerçevesinde silinmesini isteme,</li>
          <li>İşlemlerin ilgili üçüncü kişilere bildirilmesini isteme,</li>
          <li>Otomatik sistemlerle analiz sonucu aleyhe bir sonucun ortaya çıkmasına itiraz etme,</li>
          <li>Kanuna aykırı işlenme nedeniyle zarara uğramanız halinde zararın giderilmesini talep etme.</li>
        </ul>
        <p>
          Bu haklarınızı kullanmak için <strong>support@vintotap.com</strong>
          adresine yazılı olarak başvurabilirsiniz. Hesap ayarlarınızdan
          profilinizi güncelleyebilir veya hesabınızı doğrudan silebilirsiniz.
        </p>
      </section>

      <section>
        <h2>11. Değişiklikler</h2>
        <p>
          Bu metin, yasal değişiklikler veya Hizmetteki güncellemeler
          doğrultusunda güncellenebilir. Güncel sürüm her zaman bu sayfada
          yayında olur.
        </p>
      </section>
    </LegalLayout>
  )
}
