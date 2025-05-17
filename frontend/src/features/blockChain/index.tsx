import { NavLayout } from '@/components'
import { Title } from '@/components/TitleHeader/styles'
import { Description, RegularLabel } from '@/styles/styles'

import './styles.css'

export function BlockChainPage() {
  return (
    <NavLayout title="블록체인 가이드">
      <div className="page sans">
        <header>
          <Title>
            <span className="icon">🎡</span>블록체인 확인 페이지
          </Title>
        </header>
        <div className="page-body">
          <RegularLabel>
            <a href="https://polygonscan.com/">https://polygonscan.com/</a>
          </RegularLabel>
          <figure className="image">
            <img
              style={{ width: '709.99px' }}
              src="/images/blockChain/image.png"
              alt="PolygonScan"
            />
          </figure>
          <RegularLabel>위의 링크를 타고 들어가서 빨간 박스에 </RegularLabel>

          <ol>
            <li>
              <Description>
                공과금 내역 ⇒{' '}
               
              </Description>
            </li>
            <li>
              <Description>
                서약서 내역 ⇒{' '}
              </Description>
            </li>
            <li>
              <Description>
                월세 내역 ⇒{' '}
              </Description>
            </li>
          </ol>
          <RegularLabel>
            를 작성한 후 아래와 같은 페이지에서 블록체인 내역 확인 가능!!!
          </RegularLabel>
          <figure className="image">
            <img
              style={{ width: '709.99px' }}
              src="/images/blockChain/image2.png"
              alt="Blockchain Details 1"
            />
          </figure>
          <figure className="image">
            <img
              style={{ width: '709.98px' }}
              src="/images/blockChain/image3.png"
              alt="Blockchain Details 2"
            />
          </figure>
        </div>
      </div>
    </NavLayout>
  )
}
