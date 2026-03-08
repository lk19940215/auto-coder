import { AppShell, Burger, Group, Anchor, UnstyledButton, Text } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { IconList, IconInfoCircle } from '@tabler/icons-react'
import { Outlet, Link, useLocation } from 'react-router-dom'

function App() {
  const [mobileOpened, { toggle: toggleMobile }] = useDisclosure()
  const [desktopOpened, { toggle: toggleDesktop }] = useDisclosure(true)
  const location = useLocation()

  const navLinks = [
    { path: '/', label: '首页', icon: IconList },
    { path: '/about', label: '关于', icon: IconInfoCircle },
  ]

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/'
    }
    return location.pathname.startsWith(path)
  }

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{
        width: 200,
        breakpoint: 'sm',
        collapsed: { mobile: !mobileOpened, desktop: !desktopOpened },
      }}
      padding="md"
    >
      <AppShell.Header>
        <Group h="100%" px="md">
          <Burger
            opened={mobileOpened}
            onClick={toggleMobile}
            hiddenFrom="sm"
            size="sm"
          />
          <Burger
            opened={desktopOpened}
            onClick={toggleDesktop}
            visibleFrom="sm"
            size="sm"
          />
          <Group gap="sm" className="flex items-center">
            <IconList size={24} stroke={1.5} />
            <Text fw={600} size="lg">TODO 待办事项</Text>
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="md">
        <nav>
          {navLinks.map((link) => {
            const Icon = link.icon
            const active = isActive(link.path)
            return (
              <Anchor key={link.path} component={Link} to={link.path} underline="never">
                <UnstyledButton
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    marginBottom: '4px',
                    borderRadius: '8px',
                    backgroundColor: active ? 'var(--mantine-color-blue-light)' : 'transparent',
                    color: active ? 'var(--mantine-color-blue-6)' : 'var(--mantine-color-black)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                  className="hover-bg-blue-light"
                >
                  <Group gap="sm">
                    <Icon size={20} stroke={1.5} />
                    <Text fw={active ? 600 : 400}>{link.label}</Text>
                  </Group>
                </UnstyledButton>
              </Anchor>
            )
          })}
        </nav>
      </AppShell.Navbar>

      <AppShell.Main>
        <Outlet />
      </AppShell.Main>
    </AppShell>
  )
}

export default App
