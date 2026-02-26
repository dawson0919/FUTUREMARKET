import { Separator } from "@/components/ui/separator";

export const metadata = {
  title: "使用條款 - FutureMarket",
  description: "FutureMarket 平台使用條款",
};

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto py-8">
      <h1 className="text-3xl font-bold mb-2">FutureMarket 使用條款</h1>
      <p className="text-muted-foreground text-sm mb-8">
        最後更新日期：2026 年 2 月 25 日
      </p>

      <div className="prose prose-invert max-w-none space-y-8 text-sm leading-relaxed text-muted-foreground">
        {/* 1. Introduction */}
        <section>
          <h2 className="text-xl font-bold text-foreground mb-3">一、簡介</h2>
          <p>
            本使用條款（以下簡稱「條款」）規範您（無論是個人或代表實體）使用、互動或以其他方式存取
            FutureMarket 平台（以下簡稱「平台」、「我們」）所提供之介面與功能的條件。
          </p>
          <p className="mt-2">
            本條款連同我們的隱私權政策，構成您與我們之間具有約束力的協議。當您存取、使用或以其他方式
            與平台互動（包括連結您的帳戶或建立識別碼）時，即表示您已閱讀、理解並同意受本條款約束。
            若您不同意本條款，則不得使用本平台。
          </p>
        </section>

        <Separator />

        {/* 2. Platform Description */}
        <section>
          <h2 className="text-xl font-bold text-foreground mb-3">二、平台說明</h2>

          <h3 className="text-base font-semibold text-foreground mt-4 mb-2">2.1 平台功能</h3>
          <p>
            FutureMarket 是一個以虛擬籌碼為基礎的預測市場平台，提供以下功能：
          </p>
          <ul className="list-disc list-inside space-y-1 mt-2">
            <li>針對加密貨幣（BTC、ETH、PAXG）及期貨（NQ、ES）的每日收盤價預測</li>
            <li>基於 CPMM（恆定乘積做市商）模型的定價機制</li>
            <li>每日自動建立市場、結算市場的完整週期</li>
            <li>排行榜、投資組合等競技功能</li>
          </ul>

          <h3 className="text-base font-semibold text-foreground mt-4 mb-2">2.2 虛擬籌碼性質</h3>
          <p>
            本平台所有交易均使用<span className="text-foreground font-semibold">虛擬籌碼</span>進行，
            不涉及任何真實貨幣、加密貨幣或有價資產。虛擬籌碼沒有任何現金價值，不可兌換、轉讓、出售或
            用於購買任何商品或服務。每位用戶註冊時獲得 100,000 枚免費籌碼。
          </p>

          <h3 className="text-base font-semibold text-foreground mt-4 mb-2">2.3 資訊僅供參考</h3>
          <p>
            平台上顯示的所有價格資訊、市場數據和預測結果僅供參考。我們不保證資訊的即時性、完整性或
            準確性。平台上顯示的任何資訊均不構成投資建議、交易建議或任何形式的財務建議。
          </p>
        </section>

        <Separator />

        {/* 3. Game Rules */}
        <section>
          <h2 className="text-xl font-bold text-foreground mb-3">三、遊戲規則</h2>

          <h3 className="text-base font-semibold text-foreground mt-4 mb-2">3.1 每日市場週期</h3>
          <ul className="list-disc list-inside space-y-1">
            <li>每日系統根據最新市場價格自動建立多個價位的預測市場</li>
            <li>每個市場提問：「該商品今日收盤價是否會高於目標價格？」</li>
            <li>玩家選擇「是」或「否」下注，投入虛擬籌碼</li>
            <li>收盤時間到達後，系統自動取得收盤價並結算所有市場</li>
            <li>預測正確者按比例獲得獎金池派彩，預測錯誤者失去下注籌碼</li>
          </ul>

          <h3 className="text-base font-semibold text-foreground mt-4 mb-2">3.2 收盤與結算時間</h3>
          <div className="overflow-x-auto mt-2">
            <table className="w-full text-sm border border-border rounded-lg overflow-hidden">
              <thead>
                <tr className="bg-secondary">
                  <th className="text-left px-4 py-2 text-foreground font-semibold">商品類型</th>
                  <th className="text-left px-4 py-2 text-foreground font-semibold">商品</th>
                  <th className="text-left px-4 py-2 text-foreground font-semibold">收盤時間 (UTC)</th>
                  <th className="text-left px-4 py-2 text-foreground font-semibold">台灣時間</th>
                  <th className="text-left px-4 py-2 text-foreground font-semibold">投注截止</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-border/50">
                  <td className="px-4 py-2">加密貨幣</td>
                  <td className="px-4 py-2">BTC、ETH、PAXG</td>
                  <td className="px-4 py-2">UTC 00:00</td>
                  <td className="px-4 py-2">08:00</td>
                  <td className="px-4 py-2">06:00（收盤前 2 小時）</td>
                </tr>
                <tr className="border-t border-border/50">
                  <td className="px-4 py-2">期貨</td>
                  <td className="px-4 py-2">NQ（Nasdaq 100）、ES（S&P 500）</td>
                  <td className="px-4 py-2">UTC 21:00</td>
                  <td className="px-4 py-2">05:00（次日）</td>
                  <td className="px-4 py-2">03:00（收盤前 2 小時）</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h3 className="text-base font-semibold text-foreground mt-4 mb-2">3.3 賠率與派彩機制</h3>
          <ul className="list-disc list-inside space-y-1">
            <li>每個市場設有「是」和「否」兩個資金池</li>
            <li>價格以分（¢）顯示：<span className="text-foreground font-semibold">是¢ + 否¢ = 100¢</span>，反映市場的隱含機率</li>
            <li>結算時，輸方資金池全額分配給贏方，依下注比例派彩</li>
            <li>
              範例：若「是」池有 10,000 籌碼，「否」池有 5,000 籌碼，總池為 15,000 籌碼。
              若你在「是」池下注 1,000（佔該池 10%），結果為「是」時，你獲得 15,000 × 10% = 1,500 籌碼
            </li>
          </ul>

          <h3 className="text-base font-semibold text-foreground mt-4 mb-2">3.4 結算價格來源</h3>
          <ul className="list-disc list-inside space-y-1">
            <li>
              加密貨幣（BTC、ETH、PAXG）：
              <span className="text-foreground font-semibold">Crypto.com</span> 交易所即時價格
              （BTC_USDT、ETH_USDT、PAXG_USDT）
            </li>
            <li>
              黃金代幣（PAXG）：
              <span className="text-foreground font-semibold">Binance</span>（PAXGUSDT）
            </li>
            <li>
              期貨（NQ、ES）：
              <span className="text-foreground font-semibold">Yahoo Finance</span>（NQ=F、ES=F）
            </li>
            <li>不同交易所或不同交易對的價格不列入結算依據</li>
          </ul>

          <h3 className="text-base font-semibold text-foreground mt-4 mb-2">3.5 假日規則</h3>
          <p>
            <span className="text-yellow-400 font-semibold">週六、週日（假日）</span>僅開放加密貨幣市場
            （BTC、ETH、PAXG）投注。期貨市場（NQ、ES）因休市而不開放。
          </p>
        </section>

        <Separator />

        {/* 4. User Responsibilities */}
        <section>
          <h2 className="text-xl font-bold text-foreground mb-3">四、用戶資格與責任</h2>

          <h3 className="text-base font-semibold text-foreground mt-4 mb-2">4.1 年齡要求</h3>
          <p>
            本平台僅供年滿 18 歲以上之用戶使用。若您未滿 18 歲，請勿使用本平台。
          </p>

          <h3 className="text-base font-semibold text-foreground mt-4 mb-2">4.2 帳戶安全</h3>
          <p>
            您有責任保管好自己的帳戶資訊及登入憑證。因帳戶被未授權存取而導致的任何損失，我們概不負責。
            若您發現帳戶有任何未授權使用的情況，請立即通知我們。
          </p>

          <h3 className="text-base font-semibold text-foreground mt-4 mb-2">4.3 遵守法律</h3>
          <p>
            您同意在使用本平台時遵守所有適用的法律、法規及規章。您保證您所在的司法管轄區允許您使用本平台，
            且您的使用不違反任何適用法律。
          </p>
        </section>

        <Separator />

        {/* 5. Prohibited Conduct */}
        <section>
          <h2 className="text-xl font-bold text-foreground mb-3">五、禁止行為</h2>
          <p>使用本平台時，您同意不從事以下行為：</p>
          <ul className="list-disc list-inside space-y-1 mt-2">
            <li>違反任何適用法律或法規</li>
            <li>提供虛假、不準確或誤導性的資訊</li>
            <li>使用任何工具或技術試圖操縱市場結果或價格</li>
            <li>進行刷單交易（wash trading）、對敲交易或其他虛假交易</li>
            <li>使用自動化工具（機器人）以不正當方式獲取優勢</li>
            <li>企圖入侵、破壞或干擾平台的正常運作</li>
            <li>將帳戶或籌碼轉讓給他人，或代替他人操作帳戶</li>
            <li>散佈騷擾性、誹謗性、不雅或攻擊性內容</li>
            <li>冒充其他用戶或平台工作人員</li>
            <li>以任何方式干擾其他用戶對平台的正常使用</li>
          </ul>
          <p className="mt-2">
            若我們發現您從事上述禁止行為，我們保留在不事先通知的情況下暫停或終止您帳戶的權利，
            並可採取任何我們認為合理且必要的措施。
          </p>
        </section>

        <Separator />

        {/* 6. Intellectual Property */}
        <section>
          <h2 className="text-xl font-bold text-foreground mb-3">六、智慧財產權</h2>

          <h3 className="text-base font-semibold text-foreground mt-4 mb-2">6.1 平台所有權</h3>
          <p>
            本平台及其所有內容、功能、技術，包括但不限於文字、圖形、標誌、圖示、圖像、音訊、
            軟體及其編排，均為我們或其授權人的財產，受著作權法、商標法及其他智慧財產權法律保護。
          </p>

          <h3 className="text-base font-semibold text-foreground mt-4 mb-2">6.2 有限授權</h3>
          <p>
            我們授予您有限的、不可轉讓的、非獨佔的、可撤銷的授權，僅供您個人以非商業目的使用本平台。
            此授權不包括對平台進行修改、複製、散佈、傳輸、展示、出版、授權、衍生著作、轉讓或出售的權利。
          </p>

          <h3 className="text-base font-semibold text-foreground mt-4 mb-2">6.3 用戶內容</h3>
          <p>
            您透過平台提交的任何內容（包括意見反饋），您授予我們免版稅、全球性、非獨佔的授權，
            得以使用、複製、修改及展示該內容，以用於提供及改善平台服務。
          </p>
        </section>

        <Separator />

        {/* 7. Disclaimers */}
        <section>
          <h2 className="text-xl font-bold text-foreground mb-3">七、免責聲明</h2>

          <h3 className="text-base font-semibold text-foreground mt-4 mb-2">7.1 娛樂性質</h3>
          <p className="text-foreground font-semibold">
            本平台僅供娛樂競技使用。所有籌碼均為虛擬貨幣，不具有任何真實貨幣價值。
            平台上的預測市場不構成任何形式的金融交易、賭博或投資活動。
          </p>

          <h3 className="text-base font-semibold text-foreground mt-4 mb-2">7.2 「現況」提供</h3>
          <p>
            本平台以「現況」（AS IS）及「可用性」（AS AVAILABLE）基礎提供。我們不就平台的準確性、
            可靠性、完整性、適用性或可用性作出任何明示或暗示的保證或陳述。您使用本平台的風險完全由您自行承擔。
          </p>

          <h3 className="text-base font-semibold text-foreground mt-4 mb-2">7.3 價格資料</h3>
          <p>
            我們不保證平台上顯示的任何價格資料的即時性或準確性。價格資料來自第三方來源
            （Crypto.com、Yahoo Finance），我們對第三方資料的可用性、準確性或可靠性不承擔任何責任。
            價格資料可能存在延遲、錯誤或中斷。
          </p>

          <h3 className="text-base font-semibold text-foreground mt-4 mb-2">7.4 服務中斷</h3>
          <p>
            平台可能因以下原因而無法存取或無法正常運作：(a) 設備故障；(b) 定期維護；
            (c) 超出我們控制範圍的原因；(d) 第三方服務中斷。我們不對任何服務中斷導致的損失負責。
          </p>
        </section>

        <Separator />

        {/* 8. Limitation of Liability */}
        <section>
          <h2 className="text-xl font-bold text-foreground mb-3">八、責任限制</h2>
          <p>
            在適用法律允許的最大範圍內，我們及我們的服務提供商對您不承擔任何間接性、附帶性、特殊性、
            衍生性或懲罰性損害賠償責任（包括但不限於利潤損失、數據損失、商譽損失或使用損失），
            即使我們已被告知此類損害的可能性。
          </p>
          <p className="mt-2">
            在任何情況下，我們在本條款項下的累計責任不超過您在提出索賠前 12 個月內
            實際支付給我們的金額（由於本平台為免費服務，此金額通常為零）。
          </p>
        </section>

        <Separator />

        {/* 9. Indemnification */}
        <section>
          <h2 className="text-xl font-bold text-foreground mb-3">九、賠償</h2>
          <p>
            您同意就因以下事項引起或與之相關的任何索賠、損害、義務、損失、責任、費用或債務
            （包括合理的律師費），對我們及我們的員工、主管、董事和代表進行辯護、賠償並使其免受損害：
          </p>
          <ul className="list-disc list-inside space-y-1 mt-2">
            <li>您使用和存取本平台</li>
            <li>您違反本條款的任何規定</li>
            <li>您違反任何第三方權利（包括但不限於智慧財產權或隱私權）</li>
            <li>因您使用本平台而導致對任何第三方造成的任何損害</li>
          </ul>
        </section>

        <Separator />

        {/* 10. Third Party */}
        <section>
          <h2 className="text-xl font-bold text-foreground mb-3">十、第三方服務</h2>
          <p>
            本平台可能整合或提供第三方服務（包括但不限於 Crypto.com、Yahoo Finance、Clerk 身分驗證服務）
            的存取。您存取和使用第三方服務可能受該第三方的附加條款和條件約束。
          </p>
          <p className="mt-2">
            我們不控制、不背書，也不對第三方服務的可用性、準確性、可靠性或內容負責。
            因使用第三方服務而產生的任何損害或損失，我們概不負責。
          </p>
        </section>

        <Separator />

        {/* 11. Modifications */}
        <section>
          <h2 className="text-xl font-bold text-foreground mb-3">十一、條款修改</h2>

          <h3 className="text-base font-semibold text-foreground mt-4 mb-2">11.1 條款更新</h3>
          <p>
            我們保留隨時修改本條款的權利。修改後的條款將發佈在平台上，並提供最後更新日期。
            修改後的條款在發佈後即刻生效。您在條款修改後繼續使用本平台，即表示您接受修改後的條款。
          </p>

          <h3 className="text-base font-semibold text-foreground mt-4 mb-2">11.2 平台修改</h3>
          <p>
            我們保留隨時修改、替換、限制存取或新增平台功能的權利，恕不另行通知。
            我們可能隨時暫停或停止（暫時或永久）平台的全部或部分服務。
          </p>
        </section>

        <Separator />

        {/* 12. Privacy */}
        <section>
          <h2 className="text-xl font-bold text-foreground mb-3">十二、隱私權</h2>
          <p>
            我們重視您的隱私。使用本平台時所收集的個人資訊將依據我們的隱私權政策進行處理。
            透過使用本平台，您同意我們根據隱私權政策收集、使用和分享您的資訊。
          </p>
          <p className="mt-2">
            本平台使用 Clerk 身分驗證服務進行用戶登入管理。有關 Clerk 如何處理您的個人資訊，
            請參閱 Clerk 的隱私權政策。
          </p>
        </section>

        <Separator />

        {/* 13. Governing Law */}
        <section>
          <h2 className="text-xl font-bold text-foreground mb-3">十三、準據法與爭議解決</h2>

          <h3 className="text-base font-semibold text-foreground mt-4 mb-2">13.1 準據法</h3>
          <p>
            本條款及因本條款引起或與之相關的任何爭議，應依中華民國（台灣）法律解釋及管轄，
            不適用法律衝突規則。
          </p>

          <h3 className="text-base font-semibold text-foreground mt-4 mb-2">13.2 爭議解決</h3>
          <p>
            在就任何爭議提起法律訴訟之前，您同意先以善意協商的方式嘗試解決爭議。
            若協商無法解決爭議，任何訴訟應提交至台灣台北地方法院管轄。
          </p>

          <h3 className="text-base font-semibold text-foreground mt-4 mb-2">13.3 集體訴訟棄權</h3>
          <p>
            在適用法律允許的最大範圍內，您同意任何爭議解決程序僅以個人身分進行，
            而非作為任何類別或集體訴訟的一方或成員。
          </p>
        </section>

        <Separator />

        {/* 14. General */}
        <section>
          <h2 className="text-xl font-bold text-foreground mb-3">十四、一般條款</h2>

          <h3 className="text-base font-semibold text-foreground mt-4 mb-2">14.1 完整協議</h3>
          <p>
            本條款構成您與我們之間關於本主題事項的完整協議，取代所有先前或同時期的陳述、
            理解、協議或通訊。
          </p>

          <h3 className="text-base font-semibold text-foreground mt-4 mb-2">14.2 可分割性</h3>
          <p>
            若本條款的任何條文被認定為無效或不可執行，其餘條款仍具有完全效力。
            無效或不可執行的條文將以最接近原始意圖的方式進行解釋。
          </p>

          <h3 className="text-base font-semibold text-foreground mt-4 mb-2">14.3 權利不棄</h3>
          <p>
            我們未行使或延遲行使本條款項下的任何權利或救濟，不構成對該權利或救濟的棄權，
            亦不限制我們日後行使該權利或救濟。
          </p>

          <h3 className="text-base font-semibold text-foreground mt-4 mb-2">14.4 不可轉讓</h3>
          <p>
            未經我們事先書面同意，您不得轉讓或移轉您在本條款項下的任何權利或義務。
            我們可以在不受限制的情況下轉讓或移轉本條款。
          </p>
        </section>

        <Separator />

        {/* 15. Contact */}
        <section>
          <h2 className="text-xl font-bold text-foreground mb-3">十五、聯繫我們</h2>
          <p>
            如果您對本條款有任何疑問或意見，請透過平台內的聯繫方式與我們聯繫。
          </p>
        </section>

        <div className="mt-12 pt-6 border-t border-border text-center text-xs text-muted-foreground">
          <p>&copy; 2026 FutureMarket. 保留所有權利。</p>
          <p className="mt-1">本平台僅供娛樂競技使用，所有籌碼均為虛擬貨幣，不涉及任何真實資金。</p>
        </div>
      </div>
    </div>
  );
}
