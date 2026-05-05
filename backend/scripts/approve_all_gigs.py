import sys
sys.path.insert(0, '.')

from models.gig import Gig


def main() -> None:
    gigs = Gig.find_pending()
    if not gigs:
        print('No pending gigs found.')
        return

    count = 0
    for gig in gigs:
        gig_id = gig.get('_id')
        if not gig_id:
            continue
        Gig.approve(gig_id)
        count += 1

    print(f'Approved {count} pending gig(s).')


if __name__ == '__main__':
    main()
